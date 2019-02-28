import React, { useState } from 'react'

import { useKey } from './lib/hooks'
import { Router, registerRoute, registerElement } from './lib/router'

import ArchiveScreen from './features/archive/ArchiveScreen.js'

import { MdShare, MdInfoOutline } from 'react-icons/md'

import ArchiveInfo from './features/archive/ArchiveInfo'
import ArchiveInfoNew from './features/archive/ArchiveInfoNew'
import ArchiveSharing from './features/archive/ArchiveSharing'

import Debug from './features/debug/Debug'
import Tags from './foo/tags'
import Panels from './foo/panels'

import '@archipel/ui/tailwind.pcss'

import './features/drive/index.js'

// registerRoute('/', ArchiveScreen)
registerRoute('/', ArchiveScreen)
registerRoute('archive', ArchiveScreen)
registerRoute('archive/:archive', ArchiveInfo, { wrap: true })
registerRoute('archive/:archive/info', ArchiveInfoNew, { wrap: true })
registerRoute('archive/:archive/share', ArchiveSharing, { wrap: true })

// registerElement('archive', {
  // actions: [
    // { name: 'Info', href: 'archive/:archive', weight: -10 },
    // { name: 'Share', href: 'archive/:archive/share', weight: -9 }
  // ]
// })

registerElement('archive', {
  actions: [
    { name: 'Info', href: 'archive/:archive', icon: MdInfoOutline },
    { name: 'Share', href: 'archive/:archive/share', icon: MdShare }
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
