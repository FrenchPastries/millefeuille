import * as http from 'http'
import * as helpers from './helpers'
import body from './error-page/templates/body'

export const render = body

export const fixFormat = (headers: http.IncomingHttpHeaders, error: Error) => {
  const toSend = helpers.errorPage.fromError(error)
  if (headers.accept?.includes('text/html')) {
    return render(toSend)
  } else {
    return JSON.stringify(toSend)
  }
}
