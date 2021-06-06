import * as http from 'http'

export interface IncomingRequest extends http.IncomingMessage {
  body: any
  [key: string]: any
}

export type Headers = {
  [key: string]: string
}

export type ServerResponse<Body> = {
  statusCode: number
  headers: Headers
  body: Body
}
