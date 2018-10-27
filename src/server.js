const http = require('http')

const selectPort = (options = {}) => process.env.PORT || options.port || 8080

const sendResponse = (handler, request, response) => {
  Promise.resolve(handler(request))
    .then(({ headers, body, statusCode }) => {
      response.statusCode = statusCode
      Object
        .keys(headers)
        .map(key => response.setHeader(key, headers[key]))
      response.write(body)
      response.end()
    })
    .catch(({ statusCode }) => {
      response.statusCode = statusCode
      response.end()
    })
}

const create = (handler, options = {}) => {
  const server = http.createServer((request, response) => {
    request.context = {}
    const method = request.method
    if (method === 'POST') {
      let body = ''
      request.on('data', chunk => body += chunk.toString())
      request.on('end', () => {
        request.body = body
        sendResponse(handler, request, response)
      })
    } else {
      sendResponse(handler, request, response)
    }
  })
  server.listen(selectPort(options))
  return server
}

module.exports = {
  create
}
