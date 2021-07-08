import * as url from 'url'
import * as http from 'http'
import * as millefeuille from '../types'

export const setURL = (request: millefeuille.IncomingRequest) => {
  if (request.url) {
    const newUrl = new url.URL(request.url, 'http://0.0.0.0')
    request.location = newUrl
  }
}

export const setHeaders = (
  response: http.ServerResponse,
  headers: millefeuille.Headers | undefined = {}
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
