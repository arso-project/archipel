import { FileMetadataEditor } from './MetadataEditor'

import registry from '../../lib/component-registry'

export default function start () {
  console.log('at Mount:', FileMetadataEditor)
  registry.add('fileSidebar', FileMetadataEditor, { title: 'MetadataEditor' })
}
