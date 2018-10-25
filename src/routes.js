const { debugMap } = require('./helpers')

const getRouteSegments = route => route.split('/').slice(1)

const addHandler = (segments, pathSegments, handler) => {
  if (pathSegments.length === 0) {
    return handler
  } else {
    const part = pathSegments[0]
    if (part.startsWith(':')) {
      const global_ = segments.global || {}
      segments = {}
      segments.global = {
        name: part.slice(1),
        handler: addHandler(
          global_,
          pathSegments.slice(1),
          handler
        )
      }
    } else {
      const handlerPart = segments[part] || {}
      segments[part] = addHandler(
        handlerPart,
        pathSegments.slice(1),
        handler
      )
    }
    return segments
  }
}

const selectHandler = (method, methodHandlers, route, handler) => {
  if (method === 'NOT_FOUND') {
    return handler
  } else {
    const routeSegments = getRouteSegments(route)
    return addHandler(
      methodHandlers,
      routeSegments,
      handler
    )
  }
}

const createRouterHash = (acc, { method, route, handler }) => {
  const methodHandlers = acc[method] || {}
  const updatedHandlers = selectHandler(
    method,
    methodHandlers,
    route,
    handler
  )
  acc[method] = updatedHandlers
  return acc
}

// const getHandler = request => {
//   const globalMatcher = acc.global
//   if (globalMatcher) {
//     request.context[globalMatcher.name] = value
//     return acc.global.handler
//   } else {
//     if (acc[value]) {
//       return acc[value]
//     } else {
//       if (acc['ANY']) {
//         return acc['ANY']
//       } else {
//         return null
//       }
//     }
//   }
// }

const getHandlerWithMethod = (allHandlers, request, pathSegments) => {
  console.log(pathSegments)
  console.log(allHandlers)
  if (typeof allHandlers === 'function') {
    return allHandlers
  }

  if (pathSegments.length === 0) {
    return allHandlers
  }

  const value = pathSegments[0]
  const globalMatcher = allHandlers.global
  if (globalMatcher) {
    request.context[globalMatcher.name] = value
    return getHandlerWithMethod(allHandlers.global.handler, request, pathSegments.slice(1))
  } else {
    if (allHandlers[value]) {
      return getHandlerWithMethod(allHandlers[value], request, pathSegments.slice(1))
    } else {
      return null
    }
  }
}

const getHandler = (request, pathSegments, routesHash) => {
  console.log('start')
  const getHandler = getHandlerWithMethod(
    routesHash[request.method] || {},
    request,
    pathSegments
  )
  console.log('between')
  const anyHandler = getHandlerWithMethod(
    routesHash['ANY'] || {},
    request,
    pathSegments
  )
  console.log('end')
  return getHandler || anyHandler
}

const routeRequest = routesHash => request => {
  const pathSegments = getRouteSegments(request.url)
  // const pathSegmentsSegment = routesHash[request.method]
  // console.log(pathSegments)
  console.log(routesHash)
  const handler = getHandler(request, pathSegments, routesHash)
  // console.log(request)
  console.log(handler)
  if (typeof handler === 'function') {
    return handler(request)
  } else if (handler) {
    return handler[''](request)
  } else {
    return routesHash('NOT_FOUND')(request)
  }
}

// routes : [ Route ] => Handler
const routes = routes => {
  const routesHash = routes.reduce(createRouterHash, {})
  // console.log(routesHash)
  console.log(routesHash)
  return routeRequest(routesHash)
}

// Path = { segment : Handler | Path }
// paths = { HttpType : Path }

// HttpType = GET | POST | PATCH | PUT | DELETE | OPTIONS | ANY

// Handler = Request => Response

// Route = {
//   method : HttpType,
//   route : URL,
//   handler : Handler
// }

const addTrailingSlash = route => {
  if (route.length > 1) {
    if (route.endsWith('/')) {
      return route
    } else {
      return `${route}/`
    }
  } else {
    return route
  }
}

// matcher : HttpType => (URL, Handler) -> Route
const matcher = method => (route, handler) => ({
  method: method,
  route: addTrailingSlash(route),
  handler: handler
})

// x : (URL, Handler) => Route
const get = matcher('GET')
const post = matcher('POST')
const patch = matcher('PATCH')
const put = matcher('PUT')
const del = matcher('DELETE')
const options = matcher('OPTIONS') // eslint-disable-line
const any = matcher('ANY')

// notFound : Handler => Route
const notFound = handler => ({
  method: 'NOT_FOUND',
  handler: handler
})

// context : (URL, [ Route ] | Handler) => Route
const context = (endpoint, routesOrHandler) => {
  switch (typeof routesOrHandler) {
    case 'function': return any(endpoint, routesOrHandler)
    case 'object': return any(endpoint,
      routes(
        routesOrHandler
          .map(elem => {
            elem.route = addTrailingSlash(`${endpoint}${elem.route}`)
            return elem
          })
          // .map(debugMap)
      )
    )
    default: throw 'Context Error'
  }
}

module.exports = {
  routes,
  context,
  get,
  post,
  patch,
  put,
  del,
  any,
  notFound
}
