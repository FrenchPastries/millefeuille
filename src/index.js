const http = require('http')

const response = require('./response')
const errorPage = require('./error-page')
const helpers = require('./helpers')
const logger = require('./logger')

const renderError = (headers, content) => {
  const jsonContent = JSON.stringify(content, null, 2)
  const message = `The object you provided is:\n${jsonContent}`
  if (headers.accept.includes('text/html')) {
    return errorPage.render({ message })
  } else {
    return message
  }
}

const renderErrorEmptyBody = (headers, content) => {
  const toSend = helpers.errorPage.fromContent(content)
  if (headers.accept.includes('text/html')) {
    return errorPage.render(toSend)
  } else {
    return JSON.stringify(toSend)
  }
}

const renderBodyOrError = (headers, content) => (body, errorRenderer) => {
  if (content.statusCode) {
    return body
  } else if (helpers.config.isDev) {
    return errorRenderer(headers, content)
  } else {
    return 'Internal Server Error'
  }
}

const bodyOrErrorPage = (headers, content) => {
  const renderer = renderBodyOrError(headers, content)
  if (content.body) {
    return renderer(content.body, renderError)
  } else {
    return renderer(undefined, renderErrorEmptyBody)
  }
}

const normalizeResponse = headers => content => {
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

const sendResponse = response => content => {
  const { statusCode, headers, body } = content
  response.statusCode = statusCode
  helpers.requests.setHeaders(response, headers)
  if (body) {
    response.write(body)
  }
  response.end()
}

const normalizeError = headers => error => {
  if (error instanceof Error) {
    logger.stacktrace(error)
    const body = errorPage.fixFormat(headers, error)
    return { statusCode: 500, headers: {}, body }
  } else {
    return normalizeResponse(headers)(error)
  }
}

const handleResponse = (handler, request, response) => {
  return Promise.resolve(handler(request))
    .then(normalizeResponse(request.headers))
    .catch(normalizeError(request.headers))
    .then(sendResponse(response))
}

const handleRequests = handler => async (request, response) => {
  helpers.requests.setURL(request)
  await helpers.requests.extractBody(request)
  await handleResponse(handler, request, response)
}

const selectPort = ({ port }) => port || process.env.PORT || 8080

const create = (handler, options = {}) => {
  const server = http.createServer(handleRequests(handler))
  server.listen(selectPort(options))
  return server
}

const stop = server => server.close()

module.exports = {
  create,
  stop,
}
