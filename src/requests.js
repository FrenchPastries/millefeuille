const response = body => ({
  statusCode: 200,
  headers: {},
  body: body
})

const contentType = (response, type) => ({
  statusCode: response.statusCode,
  headers: {
    ...response.headers,
    'Content-Type': type
  },
  body: response.body
})

const redirect = url => ({
  statusCode: 302,
  headers: {
    'Location': url
  },
  body: ''
})

const badRequest = body => ({
  statusCode: 400,
  headers: {},
  body: body
})

const internalError = body => ({
  statusCode: 500,
  headers: {},
  body: body
})

module.exports = {
  response,
  contentType,
  redirect,
  badRequest,
  internalError
}
