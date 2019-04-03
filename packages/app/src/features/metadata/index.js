import { FileMetadataEditor } from './MetadataEditor'

import registry from '../../lib/component-registry'

export default function start () {
  registry.add('fileSidebar', FileMetadataEditor, { title: 'MetadataEditor' })
}
