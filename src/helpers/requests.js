const url = require('url')

const setURL = request => {
  request.url = url.parse(request.url, true)
  return request.url
}

const setHeaders = (response, headers) => {
  const setHeader = key => response.setHeader(key, headers[key])
  Object.keys(headers).forEach(setHeader)
}

const extractBody = request => {
  return new Promise(resolve => {
    let body = ''
    request.on('data', chunk => (body += chunk.toString()))
    request.on('end', () => {
      if (body !== '') {
        request.body = body
      }
      resolve(request)
    })
  })
}

module.exports = { setURL, setHeaders, extractBody }
