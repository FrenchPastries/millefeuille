const should = require('chai').should() // eslint-disable-line
const fetch = require('node-fetch')

const MilleFeuille = require('../src/index')

const PORT = 12345
const ENDPOINT = `http://localhost:${PORT}`

const createMilleFeuille = handler => MilleFeuille.create(handler, { port: PORT })

describe('MilleFeuille', function() {
  context('When giving direct responses', function() {
    it('should properly handle correct responses', async function() {
      const server = createMilleFeuille(() => ({ statusCode: 200 }))
      const response = await fetch(ENDPOINT)
      response.status.should.be.equal(200)
      server.close()
    })

    it('should return a 500 error if incorrect responses', async function() {
      const server = createMilleFeuille(() => 'Ok')
      const response = await fetch(ENDPOINT)
      response.status.should.be.equal(500)
      server.close()
    })
  })

  context('When giving successful promises', function() {
    it('should properly handle correct responses', async function() {
      const server = createMilleFeuille(() => Promise.resolve({ statusCode: 200 }))
      const response = await fetch(ENDPOINT)
      response.status.should.be.equal(200)
      server.close()
    })

    it('should return a 500 error if incorrect responses', async function() {
      const server = createMilleFeuille(() => Promise.resolve({}))
      const response = await fetch(ENDPOINT)
      response.status.should.be.equal(500)
      server.close()
    })
  })

  context('When giving failed promises', function() {
    it('should properly handle failure with 500 error', async function() {
      const server = createMilleFeuille(() => Promise.reject('Error'))
      const response = await fetch(ENDPOINT)
      response.status.should.be.equal(500)
      server.close()
    })

    it('should handle failure with proper statusCode', async function() {
      const server = createMilleFeuille(() => Promise.reject({ statusCode: 403 }))
      const response = await fetch(ENDPOINT)
      response.status.should.be.equal(403)
      server.close()
    })
  })
})
