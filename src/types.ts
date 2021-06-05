import * as http from 'http'

export interface IncomingRequest extends http.IncomingMessage {
  body: string | Object | null
}

export type Headers = {
  [key: string]: string
}

export type ServerResponse<Body> = {
  statusCode: number
  headers: Headers
  body: Body
}
