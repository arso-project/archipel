import { Router, useRouter, registerRoute, registerElement, getWrappers } from './lib/router'

import Tags from './foo/tags'
import Panels from './foo/panels'

import archiveInit from './features/archive'
import driveInit from './features/drive'
import graphInit from './features/graph'
import metadataInit from './features/metadata'

import { ArchiveListWrapper, ArchiveTabsWrapper, NoArchive } from './features/archive/ArchiveScreen.js'
import ArchiveInfo from './features/archive/ArchiveInfo'
import ArchiveInfoNew from './features/archive/ArchiveInfoNew'
import ArchiveSharing from './features/archive/ArchiveSharing'

import { MdShare, MdInfoOutline } from 'react-icons/md'

function defaultInit () {
  registerRoute('/', NoArchive, {
    Wrapper: ArchiveListWrapper
  })

  registerRoute('archive', NoArchive)

  registerRoute('archive/:archive', ArchiveInfo, {
    Wrapper: ArchiveTabsWrapper
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
}

export default function init (extensions) {
  let inits = [defaultInit, archiveInit, driveInit, metadataInit] // graphInit
  if (extensions) inits = inits.concat(extensions)

  inits.forEach(ext => {
    if (!ext) return
    let fn
    if (typeof ext === 'function') fn = ext
    else if (typeof ext.default === 'function') fn = ext.default
    if (!fn) return
    // todo: allow register by return.
    let ret = fn()
    if (ret) registerByReturn(ret)
  })
}

function registerByReturn (ret) {
  console.log('REGREG', ret)
}
