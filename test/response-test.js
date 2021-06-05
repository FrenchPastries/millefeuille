const should = require('chai').should() // eslint-disable-line

const util = require('../dist/response')

describe('Response utility', function () {
  specify('response should be correct response', function () {
    const res = util.response('Ok')
    res.should.be.deep.equal({ statusCode: 200, headers: {}, body: 'Ok' })
  })

  specify('redirect should be correct redirect response', function () {
    const res = util.redirect('https://frenchpastries.org')
    const headers = { Location: 'https://frenchpastries.org' }
    res.should.be.deep.equal({ statusCode: 302, headers, body: '' })
  })

  specify('badRequest should be correct bad request response', function () {
    const res = util.badRequest('Error')
    res.should.be.deep.equal({ statusCode: 400, headers: {}, body: 'Error' })
  })

  specify('forbidden should be correct forbidden response', function () {
    const res = util.forbidden('Error')
    res.should.be.deep.equal({ statusCode: 403, headers: {}, body: 'Error' })
  })

  specify('internalError should be correct internal server error', function () {
    const res = util.internalError('Error')
    res.should.be.deep.equal({ statusCode: 500, headers: {}, body: 'Error' })
  })

  specify(
    'contentType to generate a new response with correct contentType',
    function () {
      const res = util.response('Ok')
      const newRes = util.contentType(res, 'application/json')
      res.should.be.deep.equal({ statusCode: 200, headers: {}, body: 'Ok' })
      const headers = { 'Content-Type': 'application/json' }
      newRes.should.be.deep.equal({ statusCode: 200, headers, body: 'Ok' })
      newRes.should.not.be.equal(res)
    }
  )
})
