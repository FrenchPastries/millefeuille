const createResponse = (statusCode, headers, body) => {
  return { statusCode, headers, body }
}

const contentType = ({ statusCode, headers, body }, type) => {
  const newHeaders = { ...headers, 'Content-Type': type }
  return createResponse(statusCode, newHeaders, body)
}

const redirect = url => {
  const headers = { Location: url }
  return createResponse(302, headers, '')
}

const response = body => createResponse(200, {}, body)
const badRequest = body => createResponse(400, {}, body)
const forbidden = body => createResponse(403, {}, body)
const internalError = body => createResponse(500, {}, body)

module.exports = {
  response,
  contentType,
  redirect,
  badRequest,
  forbidden,
  internalError,
}
