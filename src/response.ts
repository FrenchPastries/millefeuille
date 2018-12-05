import { Response } from './types'

const response = <T>(body: T) => ({
  statusCode: 200,
  headers: {},
  body
})

const contentType = <T>(response: Response<T>, type: string) => ({
  statusCode: response.statusCode,
  headers: {
    ...response.headers,
    'Content-Type': type
  },
  body: response.body
})

const redirect = (url: string) => ({
  statusCode: 302,
  headers: {
    'Location': url
  },
  body: ''
})

const badRequest = <T>(body: T) => ({
  statusCode: 400,
  headers: {},
  body
})

const forbidden = <T>(body: T) => ({
  statusCode: 403,
  headers: {},
  body
})

const internalError = <T>(body: T) => ({
  statusCode: 500,
  headers: {},
  body: body
})

export {
  response,
  contentType,
  redirect,
  badRequest,
  forbidden,
  internalError
}
