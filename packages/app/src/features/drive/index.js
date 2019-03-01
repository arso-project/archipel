import { registerRoute, registerElement } from '../../lib/router'
import { FilePage, FilePageWrapper } from './FsScreen.js'
import UploadFile from './UploadFile'
import CreateDir from './CreateDir'

import { MdCreateNewFolder, MdInsertDriveFile } from 'react-icons/md'

import { init } from './file'

export default function start () {
  registerRoute('archive/:archive/file', FilePage, { Wrapper: FilePageWrapper })
  registerRoute('archive/:archive/file/*', FilePage)

  registerElement('archive/:archive', {
    link: [
      { name: 'Files', href: 'archive/:archive/file', weight: -8 }
    ]
  })

  registerElement('archive/:archive/file', {
    actions: [
      { name: 'Upload files', component: UploadFile, icon: MdInsertDriveFile, match: file => file.isDirectory },
      { name: 'Create directory', component: CreateDir, icon: MdCreateNewFolder, match: file => file.isDirectory }
    ]
  })

  init()
}
