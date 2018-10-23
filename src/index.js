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

const allRoutes = routes({
  '/users': get(handleUsers),
  '/user/:id': {
    '/': post(handleUser),
    '/posts': post(handleUserPosts),
    '/post/:id': post(handleUserPost)
  },
  '/products': get(handleProducts),
  '/product/:id': get(handleProduct),
  'not-found': handleNotFound
})

const allRoutes = routes(
  get('/users', handleUsers),
  context('/user/:id',
    post('/', handleUser),
    post('/posts', handleUserPosts),
    post('/post/:id', handleUserPost)
  ),
  get('/products', handleProducts),
  get('/product/:id', handleProduct),
  notFound(handleNotFound)
)

const server = Server.create(
  stringifyBody(allRoutes)
)

console.log(`Server Started on port: 8080`)
