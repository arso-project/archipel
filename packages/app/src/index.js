import React, { useState, useEffect } from 'react'

import { useKey } from './lib/hooks'
import { Router, getWrappers } from './lib/router'

import Debug from './features/debug/Debug'

import '@archipel/ui/tailwind.pcss'

import { getApi } from './lib/api'

import init from './init'

async function start (config, extensions) {
  // This connects to the backend.
  let api = await getApi(config)
  // This inits the frontend (routes, elements).
  init(extensions)
  return api
}

export function App (props) {
  const { config, extensions } = props
  const [api, setApi] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    start(config, extensions)
      .then(api => setApi(api))
      .catch(e => setError(e))
  }, [config])

  if (error || !api) return <Fallback error={error} />
  return <Router attach global Wrapper={Wrapper} />
}

function Fallback (props) {
  let { error } = props
  if (error && typeof error === 'object') {
    console.error(error)
    error = error.toString()
  }

  let cls = 'text-2xl mx-auto my-8'

  return (
    <AppFrame>
      <div className={cls}>
        { error && <span className='text-red'>{error}</span>}
      </div>
    </AppFrame>
  )
}

function Wrapper (props) {
  const { children, router } = props
  const { route } = router

  const [zoom, setZoom] = useState(0)

  useKey('+', e => zoomIn())
  useKey('-', e => zoomOut())

  function zoomIn () {
    let wrappers = getWrappers(route)
    setZoom(zoom => zoom < wrappers.length ? zoom + 1 : zoom)
  }
  function zoomOut () {
    setZoom(zoom => zoom > 0 ? zoom - 1 : zoom)
  }

  // todo: do something with color.
  let color = 'blue'
  if (zoom) color = 'pink'
  if (zoom > 1) color = 'black'

  let rendered = children
  let wrappers = getWrappers(route)
  let filteredWrappers = wrappers.slice(0, wrappers.length - zoom)

  filteredWrappers.forEach(Wrapper => {
    rendered = <Wrapper router={router}>{rendered}</Wrapper>
  })

  return (
    <AppFrame color={color}>
      {rendered}
    </AppFrame>
  )
}

function AppFrame (props) {
  const { children, color } = props
  return (
    <div className='flex flex-col h-screen font-sans'>
      <div className={`flex-1 border-8 border-${color}-dark p-4`}>
        {children}
      </div>
      <div className='flex-0 max-w-1/2'>
        <Debug />
      </div>
    </div>
  )
}
