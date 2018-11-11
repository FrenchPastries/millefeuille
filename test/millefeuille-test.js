const should = require('chai').should() // eslint-disable-line
const fetch = require('node-fetch')

const MilleFeuille = require('../src/index')

const PORT = 12345
const ENDPOINT = `http://localhost:${PORT}`

const createMilleFeuille = handler => MilleFeuille.create(handler, { port: PORT })

describe('MilleFeuille', function() {
  context('During creation', function() {
    it('should start on port 8080 by default', async function() {
      const server = MilleFeuille.create(() => ({ statusCode: 200 }))
      const response = await fetch('http://localhost:8080')
      response.status.should.be.equal(200)
      MilleFeuille.stop(server)
    })

    it('should start on port designated by process.env.PORT if present', async function() {
      process.env.PORT = 3456
      const server = MilleFeuille.create(() => ({ statusCode: 200 }))
      const response = await fetch('http://localhost:3456')
      response.status.should.be.equal(200)
      MilleFeuille.stop(server)
      delete process.env.PORT
    })

    it('should start on the port given in options if present (even if process.env.PORT is set)', async function() {
      process.env.PORT = 3456
      const server = MilleFeuille.create(() => ({ statusCode: 200 }), { port: 4567 })
      const response = await fetch('http://localhost:4567')
      response.status.should.be.equal(200)
      MilleFeuille.stop(server)
      delete process.env.PORT
    })
  })

  context('When giving direct responses', function() {
    it('should properly handle correct responses', async function() {
      const server = createMilleFeuille(() => ({ statusCode: 200 }))
      const response = await fetch(ENDPOINT)
      response.status.should.be.equal(200)
      MilleFeuille.stop(server)
    })

    it('should return a 500 error if incorrect responses', async function() {
      const server = createMilleFeuille(() => 'Ok')
      const response = await fetch(ENDPOINT)
      response.status.should.be.equal(500)
      MilleFeuille.stop(server)
    })
  })

  context('When giving successful promises', function() {
    it('should properly handle correct responses', async function() {
      const server = createMilleFeuille(() => Promise.resolve({ statusCode: 200 }))
      const response = await fetch(ENDPOINT)
      response.status.should.be.equal(200)
      MilleFeuille.stop(server)
    })

    it('should return a 500 error if incorrect responses', async function() {
      const server = createMilleFeuille(() => Promise.resolve({}))
      const response = await fetch(ENDPOINT)
      response.status.should.be.equal(500)
      MilleFeuille.stop(server)
    })
  })

  context('When giving failed promises', function() {
    it('should properly handle failure with 500 error', async function() {
      const server = createMilleFeuille(() => Promise.reject('Error'))
      const response = await fetch(ENDPOINT)
      response.status.should.be.equal(500)
      MilleFeuille.stop(server)
    })

    it('should handle failure with proper statusCode', async function() {
      const server = createMilleFeuille(() => Promise.reject({ statusCode: 403 }))
      const response = await fetch(ENDPOINT)
      response.status.should.be.equal(403)
      MilleFeuille.stop(server)
    })
  })
})
