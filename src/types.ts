import { IncomingHttpHeaders } from 'http'
import { Socket } from 'net'
import { UrlWithParsedQuery } from 'url'

interface Headers {
  [key: string]: string
}

interface Options {
  port?: number
}

interface Request {
  method?: string
  headers: IncomingHttpHeaders
  connection: Socket
  url?: UrlWithParsedQuery
  body?: string
  statusCode?: number
  statusMessage?: string
  socket: Socket
}

interface Response<T> {
  statusCode?: number
  headers?: Headers
  body?: T
}

type Handler<T> = (request: Request) => Response<T> | Promise<Response<T>>

type Middleware<T> = (handler: Handler<T>) => (request: Request) => Handler<T>

export {
  Headers,
  Options,
  Request,
  Response,
  Handler,
  Middleware
}
