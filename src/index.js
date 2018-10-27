const Server = require('./server')
const Routes = require('./routes')

const handler = content => request => ({ // eslint-disable-line
  statusCode: 200,
  headers: { 'Content-Type': 'application/json' },
  body: `hello world! ${content}`
})

const stringifyBody = handler => request => {
  const value = handler(request)
  const newValue = Object.assign({}, value)
  newValue.body = JSON.stringify(value.body)
  return newValue
}

const handleUsers = handler('users')
// const handleUser = handler('user')
const handleUserPosts = handler('usersPosts')
const handleUserPost = handler('userPost')
const handleGetProduct = handler('getProduct')
const handlePostProduct = handler('postProduct')
const handleProducts = handler('products')
const handleNotFound = request => ({ // eslint-disable-line
  statusCode: 404,
  headers: {},
  body: 'None'
})

const productRoutes = Routes.routes([
  Routes.get('/', handleGetProduct),
  Routes.post('/', handlePostProduct)
])

const handlerContext = () => ({
  statusCode: 200,
  headers: {},
  body: 'Hello context!'
})

const allRoutes = Routes.routes([
  Routes.get('/', handler('root')),
  Routes.get('/users', handleUsers),
  Routes.get('/test/test', handler('test')),
  Routes.context('/user/:id', [
    Routes.get('/', handlerContext),
    Routes.post('/', handlerContext),
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
