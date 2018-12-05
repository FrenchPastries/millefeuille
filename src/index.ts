import * as http from 'http'
import * as url from 'url'
import * as net from 'net'

import {
  Headers,
  Options,
  Request,
  Response,
  Handler,
  Middleware
} from './types'
import * as utils from './response'

const createRequest = (request: http.IncomingMessage): Request => ({
  method: request.method,
  headers: request.headers,
  connection: request.connection,
  url: request.url ? url.parse(request.url, true) : undefined,
  statusCode: request.statusCode,
  statusMessage: request.statusMessage,
  socket: request.socket
})

const extractBody = (request: http.IncomingMessage): Promise<string> => new Promise(resolve => {
  let body = ''
  request.on('data', (chunk: any) => body += chunk.toString())
  request.on('end', () => {
    resolve(body)
  })
})

const internalErrorMessage = 'Internal Server Error. Please, contact your administrator.'

const normalizeResponse = (content: string | Response<string>) => {
  if (typeof content === 'string') {
    return utils.internalError(content)
  } else {
    return {
      statusCode: content.statusCode || 500,
      headers: content.headers || {},
      body: content.body || internalErrorMessage
    }
  }
}

const setHeaders = (response: http.ServerResponse, headers: Headers): void => {
  const setHeader = (key: string) => response.setHeader(key, headers[key])
  Object.keys(headers).forEach(setHeader)
}

const sendResponse = (serverResponse: http.ServerResponse) => (response: Response<string>): void => {
  const { statusCode, headers, body } = normalizeResponse(response)
  serverResponse.statusCode = statusCode
  setHeaders(serverResponse, headers)
  serverResponse.write(body)
  serverResponse.end()
}

const handleResponse = (handler: Handler<string>, request: Request, response: http.ServerResponse): void => {
  Promise.resolve(handler(request))
    .then(sendResponse(response))
    .catch(sendResponse(response))
}

const handleRequests = (handler: Handler<string>) => (serverRequest: http.IncomingMessage, response: http.ServerResponse): void => {
  const request = createRequest(serverRequest)
  if (request.method === 'POST') {
    extractBody(serverRequest)
      .then(body => {
        handleResponse(handler, { ...request, body }, response)
      })
  } else {
    handleResponse(handler, request, response)
  }
}

const selectPort = (options: Options = {}) => options.port || process.env.PORT || 8080

const create = (handler: Handler<string>, options = {}): http.Server => {
  const server = http.createServer(handleRequests(handler))
  server.listen(selectPort(options))
  return server
}

const stop = (server: http.Server): http.Server => server.close()

module.exports = {
  create,
  stop
}
