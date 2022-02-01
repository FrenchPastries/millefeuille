import * as http from 'http'
import * as url from 'url'

export interface IncomingRequest<Body = any> extends http.IncomingMessage {
  body: Body
  location?: url.URL
  [key: string]: any
}

export type Headers = {
  [key: string]: string
}

export type ServerResponse<Body> = {
  statusCode: number
  headers?: Headers
  body?: Body
}
