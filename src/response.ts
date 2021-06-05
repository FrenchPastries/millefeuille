import * as millefeuille from './types'

const createResponse = <Content>(
  statusCode: number,
  headers: millefeuille.Headers,
  body: Content
): millefeuille.ServerResponse<Content> => {
  return { statusCode, headers, body }
}

export const contentType = (
  { statusCode, headers, body }: millefeuille.ServerResponse<any>,
  type: string
) => {
  const newHeaders = { ...headers, 'Content-Type': type }
  return createResponse(statusCode, newHeaders, body)
}

export const redirect = (url: string) => {
  const headers = { Location: url }
  return createResponse(302, headers, '')
}

export const response = (body: any) => createResponse(200, {}, body)
export const badRequest = (body: any) => createResponse(400, {}, body)
export const forbidden = (body: any) => createResponse(403, {}, body)
export const internalError = (body: any) => createResponse(500, {}, body)
