const http = require('./http')
const helpers = require('./helpers')

const getRouteSegments = route => route.split('/').slice(1)

const addHandler = (segments, urlSegments, handler) => {
  if (urlSegments.length === 0) {
    return handler
  } else {
    const part = urlSegments[0]
    if (part.startsWith(':')) {
      segments = {}
      segments.global = {
        name: part.slice(1),
        handler: handler
      }
    } else {
      const handlerPart = segments[part] || {}
      segments[part] = addHandler(
        handlerPart,
        urlSegments.slice(1),
        handler
      )
    }
    return segments
  }
}

const selectHandler = (method, methodHandlers, route, handler) => {
  if (method === http.request.types.NOT_FOUND) {
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

const getHandlerWithMethod = (allHandlers, request) => {
  helpers.debug('Enter in getHandlerWithMethod')
  if (typeof allHandlers === 'function' || request.routeSegments.length === 0) {
    return allHandlers
  }

  const value = request.routeSegments.shift()
  const globalMatcher = allHandlers.global
  if (globalMatcher) {
    request.context[globalMatcher.name] = value
    return getHandlerWithMethod(allHandlers.global.handler, request)
  } else {
    if (allHandlers[value]) {
      return getHandlerWithMethod(allHandlers[value], request)
    } else {
      return null
    }
  }
}

const getHandler = (request, routesSwitch) => {
  helpers.debug('Enter getHandler')
  const routeSegments = request.routeSegments.slice(0)
  const anyHandler = getHandlerWithMethod(
    routesSwitch[http.request.types.ANY] || {},
    request
  )
  if (anyHandler) {
    return anyHandler
  } else {
    request.routeSegments = routeSegments
    return getHandlerWithMethod(
      routesSwitch[request.method] || {},
      request
    )
  }
}

const responseOrNotFound = (routesSwitch, request, response) => {
  helpers.debug('Enter responseOrNotFound')
  if (!response && routesSwitch[http.request.types.NOT_FOUND]) {
    return routesSwitch[http.request.types.NOT_FOUND](request)
  } else {
    return response
  }
}

const routeRequest = routesSwitch => request => {
  helpers.debug('Enter routeRequest')
  request.routeSegments = request.routeSegments || getRouteSegments(addTrailingSlash(request.url))
  const handler = getHandler(request, routesSwitch)
  if (handler) {
    if (request.routeSegments.length === 0) {
      delete request.routeSegments
    }
    const response = handler(request)
    return responseOrNotFound(routesSwitch, request, response)
  } else {
    return responseOrNotFound(routesSwitch, request, null)
  }
}

const routes = allRoutes => {
  const routesSwitch = allRoutes.reduce(createRouterHash, {})
  helpers.debug(routesSwitch)
  return routeRequest(routesSwitch)
}

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

const matcher = method => (route, handler) => ({
  method: method,
  route: addTrailingSlash(route),
  handler: handler
})

const get = matcher(http.request.types.GET)
const post = matcher(http.request.types.POST)
const patch = matcher(http.request.types.PATCH)
const put = matcher(http.request.types.PUT)
const del = matcher(http.request.types.DELETE)
const options = matcher(http.request.types.OPTIONS)
const any = matcher(http.request.types.ANY)

const notFound = handler => ({
  method: http.request.types.NOT_FOUND,
  handler: handler
})

const context = (endpoint, routesOrHandler) => {
  switch (typeof routesOrHandler) {
    case 'function': return any(endpoint, routesOrHandler)
    case 'object': return any(endpoint, routes(routesOrHandler))
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
  options,
  any,
  notFound
}
