import React, { useState, useMemo, useContext, useRef, useEffect } from 'react'
import wayfarer from 'wayfarer'

const routes = {}
const elements = {}

export const RouterContext = React.createContext()

export default {
  registerRoute,
  registerElement,
  getRoutes,
  getRoute,
  getElements,
  getWrappers,
  isInPath,
  initRouter,
  RouterContext,
  useRouter
}

/**
 * Register a route.
 * Call with:
 * - route, component
 * OR
 * - opts {}
 * OR
 * - () => opts
 *
 * options include:
 *   component: A react component to render. Will receive a params prop.
 *   element: A HTML element to render.
 *   link: Register a link with this name or { name, icon }
 */
export function registerRoute (route, component, opts) {
  route = cleanRoute(route)
  opts = opts || {}
  if (typeof route === 'function') route = route()
  else if (component) route = { route, component, ...opts }

  // let elementKeys = ['link', 'panel']
  // for (let key of elementKeys) {
    // if (opts[key]) registerElement(route.route, { [key]: opts[key] })
  // }

  routes[route.route] = route
}

export function getRoutes () {
  return routes
}

export function getRoute (route) {
  route = cleanRoute(route)
  return routes[route]
}

export function registerElement (route, opts) {
  if (!opts) return
  route = cleanRoute(route)

  if (!elements[route]) elements[route] = {}
  for (let [key, value] of Object.entries(opts)) {
    if (!elements[route][key]) elements[route][key] = []
    if (!Array.isArray(value)) value = [value]
    elements[route][key] = [...elements[route][key], ...value]
  }
}

function cleanRoute (route) {
  if (route.charAt(0) !== '/') route = '/' + route
  return route
}

export function getElements (route) {
  if (route.charAt(0) !== '/') route = '/' + route
  /* if (route.charAt(0) === '/') route = route.substring(1) */
  return elements[route] || {}
}

export function getWrappers (route) {
  let parts = route.split('/').filter(e => e)
  let wrappers = []

  checkRoute('/')

  let cur = ''
  parts.forEach(part => {
    cur = cur + '/' + part
    checkRoute(cur)
  })

  function checkRoute (path) {
    let route = getRoute(path)
    if (!route || !route.Wrapper) return
    wrappers.push(route.Wrapper)
  }

  // Innermost wrapper should come first.
  wrappers.reverse()

  return wrappers
}

export function isInPath (href, route) {
  route = cleanRoute(route)
  href = cleanRoute(href)
  if (route.startsWith(href)) return true
  return false
}

export function initRouter (routes, onRoute, attach) {
  const router = wayfarer('/404')

  let currentPath = null
  let currentRoute = null

  for (let route of Object.values(routes)) {
    router.on(route.route, params => applyRoute(route, params))
  }

  if (attach) {
    window.onpopstate = ev => goto(window.location.hash)
    goto(window.location.hash)
  }

  return {
    router,
    goto,
    setParams
  }

  function applyRoute (route, params) {
    if (route.redirect) return goto(route.redirect)

    let elements = getElements(route.route)

    let data = { ...route, params, elements }

    if (elements.middleware) {
      elements.middleware.forEach(cb => {
        data = cb(data)
      })
    }
    currentRoute = data
    onRoute(data)
  }

  function goto (link) {
    if (Array.isArray(link)) {
      link = '/' + link.join('/')
    }
    link = hashMatch(link)
    if (link === currentPath) return
    currentPath = link
    try {
      if (attach) window.location = '#' + link
      router(link)
    } catch (e) {
      console.error('Unregistered link: ' + link)
    }
  }

  function setParams (params) {
    params = Object.assign({}, currentRoute.params, params)
    let link = buildLink(currentRoute.route, params)
    goto(link)
  }
}

function mergeRoutes (lists) {
  let routes = {}
  lists = lists.filter(l => l)
  lists.forEach(list => Object.keys(list).forEach(route => {
    routes[route] = list[route]
  }))
  return routes
}


export function Router (props) {
  const { children, attach, fallback, routes, global, Wrapper, applyWrappers } = props
  const [route, setRoute] = useState({})
  const routerRef = useRef({})

  useEffect(() => {
    let globalRoutes = global ? getRoutes() : {}

    // Allow children to directly register.
    let childRoutes = React.Children.toArray(children).reduce((routes, child) => {
      const { route } = child.props
      if (!route) return routes
      routes[route] = {
        route,
        component: () => child
      }
      return routes
    }, {})

    let mergedRoutes = mergeRoutes([globalRoutes, childRoutes, routes])

    const router = initRouter(mergedRoutes, setRoute, attach)
    routerRef.current = router
  }, [])

  const context = useMemo(() => {
    return { ...routerRef.current, ...route }
  }, [route, routerRef.current])

  let Route
  if (route.component) {
    Route = route.component
  } else if (route.element) {
    Route = props => <Element element={route.element} />
  } else {
    return fallback || null
  }

  let rendered = <Route {...context} />

  if (applyWrappers) {
  // Apply both global and route-specific wrappers.
    getWrappers(route.route).forEach(Wrapper => {
      rendered = <Wrapper router={context}>{rendered}</Wrapper>
    })
  }

  if (Wrapper) {
    rendered = <Wrapper router={context}>{rendered}</Wrapper>
  }

  return (
    <RouterContext.Provider value={context}>
      {rendered}
    </RouterContext.Provider>
  )
}

export function applyWrappers (router, route) {
}

function buildLink (route, params) {
  if (typeof route === 'string') route = route.split('/').filter(e => e)
  return route.map(el => {
    if (el.startsWith(':') && params.hasOwnProperty(el.substring(1))) {
      return params[el.substring(1)]
    } else if (el === '*' && params.wildcard) {
      return params.wildcard
    }
    return el
  })
}

export function Link (props) {
  let { link, children, params } = props
  const { goto, params: routerParams } = useRouter()
  params = Object.assign({}, routerParams, params || {})
  let resolvedLink = buildLink(link, params)
  let href = '/#/' + resolvedLink.join('/')

  return (
    <a className='no-underline' href={href} onClick={onClick}>{children}</a>
  )

  function onClick (e) {
    e.preventDefault()
    goto(resolvedLink)
  }
}

export function useRouter (props) {
  const context = useContext(RouterContext)
  return context
}

function Element (props) {
  const { element } = props
  return <div ref={setRef} />
  function setRef (el) {
    if (el) el.appendChild(element)
  }
}

function hashMatch (hash, prefix) {
  var pre = prefix || '/'
  if (hash.length === 0) return pre
  hash = hash.replace('#', '')
  hash = hash.replace(/\/$/, '')
  if (hash.indexOf('/') !== 0) hash = '/' + hash
  if (pre === '/') return hash
  else return hash.replace(pre, '')
}

// function isElement (element) {
 // return element instanceof Element || element instanceof HTMLElement
// }

// function parseLink (link) {
  // let regex = /arso:\/\/([0-9a-f]+)\/?(.*)?/
  // let res = link.match(regex)
  // // let res = parse(link)
  // return {
    // archive: res[1],
    // path: res[2]
  // }
  // return res
// }
