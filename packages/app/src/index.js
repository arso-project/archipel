import React, { useState } from 'react'

import { useKey } from './lib/hooks'
import { Router, useRouter, registerRoute, registerElement, getWrappers } from './lib/router'

import { ArchiveWrapper, NoArchive } from './features/archive/ArchiveScreen.js'

import { MdShare, MdInfoOutline } from 'react-icons/md'

import ArchiveInfo from './features/archive/ArchiveInfo'
import ArchiveInfoNew from './features/archive/ArchiveInfoNew'
import ArchiveSharing from './features/archive/ArchiveSharing'

import Debug from './features/debug/Debug'
import Tags from './foo/tags'
import Panels from './foo/panels'

import '@archipel/ui/tailwind.pcss'

import './features/drive/index.js'

registerRoute('/', NoArchive, {
  Wrapper: ArchiveWrapper
})
  // Wrapper: Wrapper
// })
registerRoute('archive', NoArchive)
registerRoute('archive/:archive', ArchiveInfo, {
  // Wrapper: ArchiveWrapper
})
registerRoute('archive/:archive/info', ArchiveInfoNew, { wrap: true })
registerRoute('archive/:archive/share', ArchiveSharing, { wrap: true })

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
      <Router attach global Wrapper={Wrapper} />
    </div>
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
    <div className='flex flex-col h-screen font-sans'>
      <div className={`flex-1 border-8 border-${color}-dark p-4`}>
        {rendered}
      </div>
      <div className='flex-0 max-w-1/2'>
        <Debug />
      </div>
    </div>
  )
}

export { default as makeCore } from './core'
