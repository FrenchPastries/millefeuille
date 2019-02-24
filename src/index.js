const http = require('http')
const url = require('url')

const utils = require('./response')

const setURL = request => request.url = url.parse(request.url, true)

const isDev = process.env.NODE_ENV !== 'production'

const extractBody = request => new Promise(resolve => {
  let body = ''
  request.on('data', chunk => body += chunk.toString())
  request.on('end', () => {
    request.body = body
    resolve(request)
  })
})

const internalErrorMessage = 'Internal Server Error. Please, contact your administrator.'

const normalizeResponse = content => {
  if (typeof content === 'string') {
    return utils.internalError(content)
  } else if (typeof content === 'object') {
    return {
      statusCode: content.statusCode || 500,
      headers: content.headers || {},
    }
  } else {
    return utils.internalError(JSON.stringify(content))
  }
}

const setHeaders = (response, headers) => {
  const setHeader = key => response.setHeader(key, headers[key])
  Object.keys(headers).forEach(setHeader)
}

const sendResponse = response => content => {
  const { statusCode, headers, body } = normalizeResponse(content)
  response.statusCode = statusCode
  setHeaders(response, headers)
  response.write(body)
  response.end()
}

const handleResponse = (handler, request, response) => {
  Promise.resolve(handler(request))
    .then(sendResponse(response))
    .catch(sendResponse(response))
}

const handleRequests = handler => (request, response) => {
  setURL(request)
  if (request.method === 'POST') {
    extractBody(request)
      .then(() => handleResponse(handler, request, response))
  } else {
    handleResponse(handler, request, response)
  }
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
