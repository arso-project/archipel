import React from 'react'
import { Heading, Modal } from '@archipel/ui'
import { MdFlashOn } from 'react-icons/md'

import { useRouter } from '../../lib/router'
import { Error } from '../../lib/result'

import { useFile } from './file'
import ListDir from './ListDir'
import CreateDir from './CreateDir'
import UploadFile from './UploadFile'
import ViewFile from './ViewFile'
import Sidebar from './Sidebar'

export default function FileScreen () {
  const { goto, params } = useRouter()
  const { archive, wildcard } = params

  let path = wildcard || '/'

  function gotoFile (fileOrPath, version) {
    let path = typeof fileOrPath === 'object' ? fileOrPath.path : fileOrPath
    goto(['archive', archive, 'file', path])
  }

  return (
    <div>
      <div className='flex max-w-full'>
        <div className='flex-0 w-64 p-4 sm:hidden'>
          <ListDir archive={archive} path={'/'} selected={path} onSelect={gotoFile} focus />
        </div>
        <div className='flex-1'>
          <File archive={archive} path={path} onSelect={gotoFile} sidebar />
        </div>
      </div>
    </div>
  )
}

function File (props) {
  const { archive, path, onSelect, sidebar } = props
  const file = useFile(archive, path)
  if (file.error) return <Error error={file.error} />

  if (!file.path) return null

  const { isDirectory } = file

  return (
    <div>
      <Heading>{path}</Heading>
      <div className='flex'>
        <div className='flex-1'>
          {isDirectory
            ? <DirGrid archive={archive} path={path} onSelect={onSelect} />
            : <ViewFile archive={archive} path={path} stat={file} />
          }
        </div>
        <div className='w-64 flex-0'>
          { !isDirectory && sidebar && <Sidebar archive={archive} path={path} /> }
        </div>
      </div>
    </div>
  )
}

function DirGrid (props) {
  const { archive, path, selected, onSelect } = props
  return (
    <div>
      <DirActions archive={archive} path={path} />
      <ListDir archive={archive} path={path} selected={selected} onSelect={onSelect} grid />
    </div>
  )
}

function DirActions (props) {
  let { archive, path } = props
  path = path || '/'
  let Toggle = props => (
    <span {...props} className='bg-purple-lightest border-1 border-purple-lighter cursor-pointer hover:bg-purple-dark hover:text-purple-lightest text-purple-dark rounded-sm inline-block p-2 font-bold italic'><MdFlashOn />Actions</span>
  )
  return (
    <Modal Toggle={Toggle}>
      <CreateDir archive={archive} path={path} />
      <UploadFile archive={archive} path={path} />
    </Modal>
  )
}
