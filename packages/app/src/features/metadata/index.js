import { MetadataEditor } from './MetadataEditor'

import registry from '../../lib/component-registry'

export default function start () {
  console.log('at Mount:', MetadataEditor)
  registry.add('fileSidebar', MetadataEditor, { title: 'MetadataEditor' })
}
