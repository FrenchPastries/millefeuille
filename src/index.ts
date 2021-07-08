import * as http from 'http'
import * as response from './response'
import * as errorPage from './error-page'
import * as helpers from './helpers'
import * as logger from './logger'
import * as millefeuille from './types'

export * from './types'

export type Handler<Input, Output> = (
  request: Input
) =>
  | millefeuille.ServerResponse<Output>
  | Promise<millefeuille.ServerResponse<Output>>

export type Options = {
  port?: number
}

const renderError = (headers: http.IncomingHttpHeaders, content: any) => {
  const jsonContent = JSON.stringify(content, null, 2)
  const message = `The object you provided is:\n${jsonContent}`
  if (headers.accept?.includes('text/html')) {
    return errorPage.render({ message })
  } else {
    return message
  }
}

const renderErrorEmptyBody = (
  headers: http.IncomingHttpHeaders,
  content: any
) => {
  const toSend = helpers.errorPage.fromContent(content)
  if (headers.accept?.includes('text/html')) {
    return errorPage.render(toSend)
  } else {
    return JSON.stringify(toSend)
  }
}

const renderBodyOrError = (headers: http.IncomingHttpHeaders, content: any) => {
  return (body: any, errorRenderer: any) => {
    if (content?.statusCode) {
      return body
    } else if (helpers.config.isDev) {
      return errorRenderer(headers, content)
    } else {
      return 'Internal Server Error'
    }
  }
}

const bodyOrErrorPage = (headers: http.IncomingHttpHeaders, content: any) => {
  const renderer = renderBodyOrError(headers, content)
  if (content.body) {
    return renderer(content.body, renderError)
  } else {
    return renderer(undefined, renderErrorEmptyBody)
  }
}

const normalizeResponse = (headers: http.IncomingHttpHeaders) => {
  return (content: any) => {
    if (typeof content === 'object') {
      return {
        statusCode: content.statusCode || 500,
        headers: content.headers || {},
        body: bodyOrErrorPage(headers, content),
      }
    } else {
      const message = JSON.stringify(content)
      if (helpers.config.isDev) {
        const fullErrorPage = errorPage.render({ message })
        return response.internalError(fullErrorPage)
      } else {
        return response.internalError(message)
      }
    }
  }
}

const sendResponse = <Content>(response: http.ServerResponse) => {
  return (content: millefeuille.ServerResponse<Content>) => {
    const { statusCode, headers, body } = content
    response.statusCode = statusCode
    helpers.requests.setHeaders(response, headers)
    if (body) {
      response.write(body)
    }
    response.end()
  }
}

const normalizeError = (headers: http.IncomingHttpHeaders) => {
  return (error: Error) => {
    if (error instanceof Error) {
      logger.stacktrace(error)
      const body = errorPage.fixFormat(headers, error)
      return { statusCode: 500, headers: {}, body }
    } else {
      return normalizeResponse(headers)(error)
    }
  }
}

const handleResponse = (
  handler: Handler<millefeuille.IncomingRequest, any>,
  request: millefeuille.IncomingRequest,
  response: http.ServerResponse
) => {
  return Promise.resolve(handler(request))
    .then(normalizeResponse(request.headers))
    .catch(normalizeError(request.headers))
    .then(sendResponse(response))
}

const handleRequests = (
  handler: Handler<millefeuille.IncomingRequest, any>
): http.RequestListener => {
  return async (request, response) => {
    helpers.requests.setURL(request as millefeuille.IncomingRequest)
    const newRequest = await helpers.requests.extractBody(request)
    await handleResponse(handler, newRequest, response)
  }
}

const selectPort = ({ port }: Options) => port || process.env.PORT || 8080

export const create = (
  handler: Handler<millefeuille.IncomingRequest, any>,
  options: Options = {}
) => {
  const server = http.createServer(handleRequests(handler))
  server.listen(selectPort(options))
  return server
}

export const stop = (server: http.Server) => server.close()
