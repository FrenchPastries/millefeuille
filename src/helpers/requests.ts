import * as url from 'url'
import * as http from 'http'
import * as millefeuille from '../types'

export const setURL = (request: http.IncomingMessage) => {
  if (request.url) {
    const newUrl = new url.URL(request.url, 'http://0.0.0.0')
    // @ts-ignore
    request.url = newUrl
  }
}

export const setHeaders = (
  response: http.ServerResponse,
  headers: millefeuille.Headers
) => {
  Object.keys(headers).forEach(key => response.setHeader(key, headers[key]))
}

export const extractBody = (
  request: http.IncomingMessage
): Promise<millefeuille.IncomingRequest> => {
  return new Promise(resolve => {
    let body = ''
    request.on('data', chunk => (body += chunk.toString()))
    request.on('end', () => {
      const newBody = body !== '' ? body : null
      // @ts-ignore
      request.body = newBody
      resolve(request as millefeuille.IncomingRequest)
    })
  })
}
