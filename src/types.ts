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

interface Response<Content> {
  statusCode?: number
  headers?: Headers
  body?: Content
}

type HandlerReturn<Content>
  = Response<Content>
  | Promise<Response<Content>>

type Handler<Content> = (request: Request) => HandlerReturn<Content>

type Middleware<Input, Output> = (handler: Handler<Input>) => (request: Request) => Handler<Output>

export {
  Headers,
  Options,
  Request,
  Response,
  Handler,
  Middleware
}
