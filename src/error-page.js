const helpers = require('./helpers')
const body = require('./error-page/templates/body')

const render = body

const fixFormat = (headers, error) => {
  const toSend = helpers.errorPage.fromError(error)
  if (headers.accept.includes('text/html')) {
    return render(toSend)
  } else {
    return JSON.stringify(toSend)
  }
}

module.exports = {
  fixFormat,
  render,
}
