import { FileMetadataEditor } from './MetadataEditor'
import MetadataHub from './MetadataHub'

import registry from '../../lib/component-registry'
import { registerRoute, registerElement } from '../../lib/router'

export default function start () {
  registry.add('fileSidebar', FileMetadataEditor, { title: 'MetadataEditor' })

  registerRoute('archive/:archive/hub', MetadataHub)

  registerElement('archive/:archive', {
    link: [
      { name: 'Hub', href: 'archive/:archive/hub', weight: 1 }
    ]
  })
}
