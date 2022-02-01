import * as http from 'http'
import * as url from 'url'

export type Headers = { [key: string]: any }
export interface IncomingRequest<Body = any> extends http.IncomingMessage {
  body: Body
  location?: url.URL
  [key: string]: any
}

export type ServerResponse<Body> = {
  statusCode: number
  headers?: Headers
  body?: Body
}
