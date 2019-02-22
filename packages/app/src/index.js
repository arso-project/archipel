import React from 'react'

import registry from './lib/component-registry.js'
import { Router, registerRoute, useRouter } from './lib/router'

import ArchiveScreen from './features/archive/ArchiveScreen.js'
import FsScreen from './features/drive/FsScreen.js'

import Debug from './features/debug/Debug'
import Tags from './foo/tags'
import Panels from './foo/panels'

import '@archipel/ui/tailwind.pcss'

registerRoute('/', ArchiveScreen)

registerRoute('/archive', ArchiveScreen)
registerRoute('/archive/:archive', ArchiveScreen)
registerRoute('/archive/:archive/*', ArchiveScreen)

let opts = {
  wrap: children => <ArchiveScreen>{children}</ArchiveScreen>
}

registerRoute('/archive/:archive/file', FsScreen, opts)
registerRoute('/archive/:archive/file/*', FsScreen, opts)

registerRoute('/tags', Tags)
registerRoute('/panels', Panels)
registerRoute('/404', () => <strong>404 Not Found</strong>)

export function App (props) {
  return (
    <div>
      <Router attach global Wrap={Wrapper} />
    </div>
  )
}

function Wrapper (props) {
  const { children, params } = props
  let color = 'pink'
  if (params.archive) color = 'blue'
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

export { default as makeCore } from './core'

