const Server = require('./server')
const Routes = require('./routes')

const handler = request => ({ // eslint-disable-line
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

const handleUsers = handler
const handleUser = handler
const handleUserPosts = handler
const handleUserPost = handler
const handleGetProduct = handler
const handlePostProduct = handler
const handleProducts = handler
const handleNotFound = request => ({ // eslint-disable-line
  code: 404,
  headers: {},
  body: 'None'
})

const productRoutes = Routes.routes([
  Routes.get('/', handleGetProduct),
  Routes.post('/', handlePostProduct)
])

const allRoutes = Routes.routes([
  Routes.get('/', handler),
  Routes.get('/users', handleUsers),
  Routes.get('/test/test', handler),
  Routes.context('/user/:id', [
    Routes.get('/', handler),
    Routes.post('/', handleUser),
    Routes.post('/posts', handleUserPosts),
    Routes.post('/post/:id', handleUserPost)
  ]),
  Routes.context('/product/:id', productRoutes),
  Routes.get('/products', handleProducts),
  Routes.notFound(handleNotFound)
])

// eslint-disable-next-line
const server = Server.create(
  stringifyBody(allRoutes)
)

console.log(`Server Started on port: 8080`)
