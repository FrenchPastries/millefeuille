const should = require('chai').should() // eslint-disable-line
const fetch = require('node-fetch')

const MilleFeuille = require('../src/index')

const PORT = 12345
const ENDPOINT = `http://localhost:${PORT}`

const createMilleFeuille = handler =>
  MilleFeuille.create(handler, { port: PORT })

describe('MilleFeuille', function () {
  context('During creation', function () {
    it('should start on port 8080 by default', async function () {
      const server = MilleFeuille.create(() => ({ statusCode: 200 }))
      const response = await fetch('http://localhost:8080')
      response.status.should.be.equal(200)
      MilleFeuille.stop(server)
    })

    it('should start on port designated by process.env.PORT if present', async function () {
      process.env.PORT = 3456
      const server = MilleFeuille.create(() => ({ statusCode: 200 }))
      const response = await fetch('http://localhost:3456')
      response.status.should.be.equal(200)
      MilleFeuille.stop(server)
      delete process.env.PORT
    })

    it('should start on the port given in options if present (even if process.env.PORT is set)', async function () {
      process.env.PORT = 3456
      const options = { port: 4567 }
      const server = MilleFeuille.create(() => ({ statusCode: 200 }), options)
      const response = await fetch('http://localhost:4567')
      response.status.should.be.equal(200)
      MilleFeuille.stop(server)
      delete process.env.PORT
    })
  })

  context('When giving direct responses', function () {
    it('should properly handle correct responses', async function () {
      const server = createMilleFeuille(() => ({ statusCode: 200 }))
      const response = await fetch(ENDPOINT)
      response.status.should.be.equal(200)
      MilleFeuille.stop(server)
    })

    it('should return a 500 error if incorrect responses', async function () {
      const server = createMilleFeuille(() => 'Ok')
      const response = await fetch(ENDPOINT)
      response.status.should.be.equal(500)
      MilleFeuille.stop(server)
    })
  })

  context('When giving successful promises', function () {
    it('should properly handle correct responses', async function () {
      const handler = () => Promise.resolve({ statusCode: 200 })
      const server = createMilleFeuille(handler)
      const response = await fetch(ENDPOINT)
      response.status.should.be.equal(200)
      MilleFeuille.stop(server)
    })

    it('should return a 500 error if incorrect responses', async function () {
      const server = createMilleFeuille(() => Promise.resolve({}))
      const response = await fetch(ENDPOINT)
      response.status.should.be.equal(500)
      MilleFeuille.stop(server)
    })
  })

  context('When giving failed promises', function () {
    it('should properly handle failure with 500 error', async function () {
      const server = createMilleFeuille(() => Promise.reject('Error'))
      const response = await fetch(ENDPOINT)
      response.status.should.be.equal(500)
      MilleFeuille.stop(server)
    })

    it('should handle failure with proper statusCode', async function () {
      const handler = () => Promise.reject({ statusCode: 403 })
      const server = createMilleFeuille(handler)
      const response = await fetch(ENDPOINT)
      response.status.should.be.equal(403)
      MilleFeuille.stop(server)
    })
  })

  context('In requests', function () {
    it('should parse the URL in the url field', async function () {
      const server = createMilleFeuille(request => {
        request.url.should.exist
        return { statusCode: 200 }
      })
      const response = await fetch(`${ENDPOINT}?test=test`)
      response.status.should.be.equal(200)
      MilleFeuille.stop(server)
    })

    it('should read the body in post requests', async function () {
      const server = createMilleFeuille(request => {
        JSON.parse(request.body).should.deep.equal({ test: 'test' })
        return { statusCode: 200 }
      })
      const body = JSON.stringify({ test: 'test' })
      const response = await fetch(ENDPOINT, { method: 'POST', body })
      response.status.should.be.equal(200)
      MilleFeuille.stop(server)
    })

    it('should be headers', async function () {
      const server = createMilleFeuille(request => {
        request.headers.should.contain.key('content-type')
        return { statusCode: 200 }
      })
      const headers = { 'Content-Type': 'application/json' }
      const response = await fetch(ENDPOINT, { headers })
      response.status.should.be.equal(200)
      MilleFeuille.stop(server)
    })
  })

  context('In responses', function () {
    it('should be able to add headers', async function () {
      const server = createMilleFeuille(() => {
        const headers = {
          'Content-Type': 'application/json',
          'Accept-Encoding': 'gzip',
        }
        return { statusCode: 200, headers, body: 'Ok' }
      })
      const response = await fetch(ENDPOINT)
      const contentType = response.headers.get('content-type')
      const acceptEncoding = response.headers.get('accept-encoding')
      contentType.should.be.equal('application/json')
      acceptEncoding.should.be.equal('gzip')
      response.status.should.be.equal(200)
      MilleFeuille.stop(server)
    })

    it('should be able to return body', async function () {
      const server = createMilleFeuille(() => ({ statusCode: 200, body: 'Ok' }))
      const response = await fetch(ENDPOINT)
      const body = await response.text()
      body.should.be.equal('Ok')
      response.status.should.be.equal(200)
      MilleFeuille.stop(server)
    })
  })
})
