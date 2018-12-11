interface Headers {
  [key: string]: string
}

interface Response<Content> {
  statusCode?: number
  headers?: Headers
  body?: Content
}

const response = <Content>(body: Content): Response<Content> => ({
  statusCode: 200,
  headers: {},
  body
})

const contentType = <Content>(response: Response<Content>, type: string): Response<Content> => ({
  statusCode: response.statusCode,
  headers: {
    ...response.headers,
    'Content-Contentype': type
  },
  body: response.body
})

const redirect = (url: string): Response<string> => ({
  statusCode: 302,
  headers: {
    'Location': url
  },
  body: ''
})

const badRequest = <Content>(body: Content): Response<Content> => ({
  statusCode: 400,
  headers: {},
  body
})

const forbidden = <Content>(body: Content): Response<Content> => ({
  statusCode: 403,
  headers: {},
  body
})

const internalError = <Content>(body: Content): Response<Content> => ({
  statusCode: 500,
  headers: {},
  body: body
})

export {
  Response,
  Headers,
  response,
  contentType,
  redirect,
  badRequest,
  forbidden,
  internalError
}
