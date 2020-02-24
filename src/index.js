const http = require('http')
const url = require('url')
const chalk = require('chalk')

const utils = require('./response')
const errorPage = require('./error-page')

const setURL = request => request.url = url.parse(request.url, true)

const isDev = process.env.NODE_ENV !== 'production'

const extractBody = request => new Promise(resolve => {
  let body = ''
  request.on('data', chunk => body += chunk.toString())
  request.on('end', () => {
    if (body !== '') {
      request.body = body
    }
    resolve(request)
  })
})

const bodyOrErrorPage = (headers, content) => {
  if (content.body) {
    if (content.statusCode) {
      return content.body
    } else {
      if (isDev) {
        const message = `The object you provided is:\n${JSON.stringify(content, null, 2)}`
        if (headers.accept.includes('text/html')) {
          return errorPage({ message })
        } else {
          return message
        }
      } else {
        return 'Internal Server Error'
      }
    }
  } else {
    if (content.statusCode) {
      return undefined
    } else {
      if (isDev) {
        const isError = content instanceof Error
        const toSend = {
          message: isError ? content.message : JSON.stringify(content, null, 2),
          stackTrace: isError ? content.stack : undefined
        }
        if (headers.accept.includes('text/html')) {
          return errorPage(toSend)
        } else {
          return JSON.stringify(toSend)
        }
      } else {
        return 'Internal Server Error'
      }
    }
  }
}

const normalizeResponse = headers => content => {
  if (typeof content === 'object') {
    return {
      statusCode: content.statusCode || 500,
      headers: content.headers || {},
      body: bodyOrErrorPage(headers, content)
    }
  } else {
    if (isDev) {
      return utils.internalError(errorPage({ message: JSON.stringify(content) }))
    } else {
      return utils.internalError(JSON.stringify(content))
    }
  }
}

const setHeaders = (response, headers) => {
  const setHeader = key => response.setHeader(key, headers[key])
  Object.keys(headers).forEach(setHeader)
}

const sendResponse = response => content => {
  const { statusCode, headers, body } = content
  response.statusCode = statusCode
  setHeaders(response, headers)
  if (body) { response.write(body) }
  response.end()
}

const normalizeError = headers => error => {
  if (error instanceof Error) {
    if (isDev) {
      console.error(chalk.bold.red(error.stack))
    }
    const toSend = {
      message: error.message,
      stackTrace: error.stack,
    }
    return {
      statusCode: 500,
      headers: {},
      body: headers.accept.includes('text/html') ? errorPage(toSend) : JSON.stringify(toSend),
    }
  } else {
    return normalizeResponse(headers)(error)
  }
}

const handleResponse = (handler, request, response) => {
  Promise.resolve(handler(request))
    .then(normalizeResponse(request.headers))
    .catch(normalizeError(request.headers))
    .then(sendResponse(response))
}

const handleRequests = handler => async (request, response) => {
  setURL(request)
  await extractBody(request)
  handleResponse(handler, request, response)
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
  stop
}
