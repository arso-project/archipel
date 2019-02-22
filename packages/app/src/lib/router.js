import React, { useState, useMemo, useContext, useRef, useEffect } from 'react'
import wayfarer from 'wayfarer'

const routes = {}

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
export function registerRoute (route, component) {
  if (typeof route === 'function') route = route()
  else if (component) route = { route, component }

  routes[route.route] = route
}

export function getRoutes () {
  return routes
}

export function initRouter (routes, onRoute) {
  const router = wayfarer('/404')

  for (let route of Object.values(routes)) {
    router.on(route.route, params => {
      let context = { ...route, params }
      // if (route.middleware) context = route.onopen(params)
      onRoute({ ...route, params })
    })
  }

  let current = null

  window.onpopstate = ev => {
    goto(window.location.hash)
  }

  return {
    router,
    goto
  }

  function goto (link) {
    link = hashMatch(link)
    if (link === current) return
    current = link
    try {
      window.location = '#' + link
      router(link)
    } catch (e) {
      console.error('Unregistered link: ' + link)
    }
  }
}

function mergeRoutes (lists) {
  let routes = {}
  lists = lists.filter(l => l)
  console.log('lists', lists)
  lists.forEach(list => Object.keys(list).forEach(route => {
    routes[route] = list[route]
  }))
  return routes
}

export const RouterContext = React.createContext()

export function Router (props) {
  const { children, attach, fallback, Wrap, routes, global } = props
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

    const { router, goto } = initRouter(mergedRoutes, setRoute)
    routerRef.current = { router, goto }

    if (attach) {
      goto(window.location.hash)
      window.onpopstate = ev => goto(window.location.hash)
    }
  }, [])

  const context = useMemo(() => {
    return { ...routerRef.current, ...route }
  }, [route, routerRef.current])

  let Route
  if (route.component) {
    Route = route.component
  } else if (route.element) {
    Route = props => <Element element={el} />
  } else {
    return fallback || null
  }

  let rendered = <Route {...context} />
  if (Wrap) rendered = <Wrap {...context}>{rendered}</Wrap>

  return (
    <RouterContext.Provider value={context}>
      {rendered}
    </RouterContext.Provider>
  )
}

export function useRouter (props) {
  const context = useContext(RouterContext)
  return context
}

function Element (props) {
  const { element, params } = props
  return <div ref={setRef} />
  function setRef (el) {
    if (el) el.appendChild(element)
  }
}

function hashMatch (hash, prefix) {
  var pre = prefix || '/';
  if (hash.length === 0) return pre;
  hash = hash.replace('#', '');
  hash = hash.replace(/\/$/, '')
  if (hash.indexOf('/') != 0) hash = '/' + hash;
  if (pre == '/') return hash;
  else return hash.replace(pre, '');
}

function isElement (element) {
 return element instanceof Element || element instanceof HTMLElement
}

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

