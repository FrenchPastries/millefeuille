const Server = require('./server')

const handler = request => ({
  code: 200,
  headers: { 'Content-Type': 'application/json' },
  body: 'hello world!'
})

const stringifyBody = handler => request => {
  const value = handler(request)
  const newValue = Object.assign({}, value)
  newValue.body = JSON.stringify(value.body)
  return newValue
}

const server = Server.create(stringifyBody(handler))

console.log(`Server Started on port: 8080`)
