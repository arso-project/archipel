import React, { useState } from 'react'

import { useKey } from './lib/hooks'
import { Router, registerRoute, registerElement } from './lib/router'

import ArchiveScreen from './features/archive/ArchiveScreen.js'

import ArchiveInfo from './features/archive/ArchiveInfo'
import ArchiveSharing from './features/archive/ArchiveSharing'

import FsScreen from './features/drive/FsScreen.js'

import Debug from './features/debug/Debug'
import Tags from './foo/tags'
import Panels from './foo/panels'

import '@archipel/ui/tailwind.pcss'

registerRoute('/', ArchiveScreen)
registerRoute('archive', ArchiveScreen)
registerRoute('archive/:archive', ArchiveInfo, { wrap: true })
registerRoute('archive/:archive/share', ArchiveSharing, { wrap: true })

registerRoute('archive/:archive/file', FsScreen, { wrap: true })
registerRoute('archive/:archive/file/*', FsScreen, { wrap: true })

registerElement('archive/:archive', {
  link: [
    { name: 'Info', href: 'archive/:archive', weight: -10 },
    { name: 'Share', href: 'archive/:archive/share', weight: -9 },
    { name: 'Files', href: 'archive/:archive/file', weight: -8 }
  ]
})

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
  let { children, params, wrap } = props
  const [chrome, setChrome] = useState(true)
  /* let color = 'pink' */
  /* if (params.archive) color = 'blue' */

  let color
  color = chrome ? 'blue' : 'pink'

  useKey('Z', ev => {
    setChrome(c => !c)
  })

  if (chrome && wrap && params.archive) {
    children = <ArchiveScreen>{children}</ArchiveScreen>
  }

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
