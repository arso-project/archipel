import React, { useState, useEffect } from 'react'
import { Heading, Modal } from '@archipel/ui'
import { Consumer } from 'ucore/react'
import { MdFlashOn } from 'react-icons/md'

import { useRouter } from '../../lib/router'

import ListDir from './ListDir'
import CreateDir from './CreateDir'
import UploadFile from './UploadFile'
import ViewFile from './ViewFile'
import Sidebar from './Sidebar'

function DirTree (props) {
  const { archive, path, selected, onSelect } = props
  return (
    <div>
      <ListDir archive={archive} path={path} selected={selected} onSelect={onSelect} focus />
    </div>
  )
}

function DirGrid (props) {
  const { archive, path, selected, onSelect } = props
  return (
    <div className=''>
      <DirActions archive={archive} path={path} />
      <div>
        <ListDir archive={archive} path={path} selected={selected} onSelect={onSelect} grid />
      </div>
    </div>
  )
}

function DirActions (props) {
  const { params } = useRouter()
  let { archive, path } = params
  path = path || '/'
  /* const { archive, path } = props */
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

function Content (props) {
  const { archive, path, onSelect } = props
  return <StatUcoreLoader Render={Render} archive={archive} path={path} />

  function Render (props) {
    const { stat } = props
    if (!stat) return null
    return (
      <>
        <Heading>{path}</Heading>
        {stat.isDirectory && <DirGrid archive={archive} path={path} onSelect={onSelect} />}
        {!stat.isDirectory && <ViewFile archive={archive} path={path} stat={stat} />}
      </>
    )
  }
}

export function StatUcoreLoader (props) {
  const { Render, archive, path } = props
  return (
    <Consumer store='fs' select='getStat' archive={archive} path={path}>
      {(stat, store) => {
        if (!stat) store.fetchStats({ archive, path })
        return <Render stat={stat} />
      }}
    </Consumer>
  )
}

export default function FsScreen () {
  const { goto, params } = useRouter()
  const { archive, wildcard } = params

  let path = wildcard
  if (!path) path = '/'

  const [version, setVersion] = useState()

  function onSelect (fileOrPath, version) {
    let path = typeof fileOrPath === 'object' ? fileOrPath.path : fileOrPath
    goto(['archive', archive, 'file', path])
  }

  return (
    <div>
      <div className='flex mb-4 max-w-full'>
        <div className='flex-0 w-64 p-4'>
          <DirTree archive={archive} dir={'/'} path={path} onSelect={onSelect} />
        </div>
        <div className='flex-1'>
          {path && <Content archive={archive} path={path} version={version} onSelect={onSelect} />}
        </div>
        <div className='flex-0 w-64'>
          {path && <Sidebar archive={archive} path={path} />}
        </div>
      </div>
    </div>
  )
}

