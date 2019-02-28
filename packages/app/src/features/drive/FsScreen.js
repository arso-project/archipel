import React, { useMemo } from 'react'
import { Modal } from '@archipel/ui'

import { getElements } from '../../lib/router'
import { Error } from '../../lib/result'

import { useFile } from './file'
import ListDir from './ListDir'
import ViewFile from './ViewFile'
import FileSidebar from './Sidebar'

function fileRouteParams (props) {
  const { goto, params } = props
  const { archive, wildcard } = params
  let path = wildcard || '/'

  return { archive, path, gotoFile }

  function gotoFile (fileOrPath, version) {
    let path = typeof fileOrPath === 'object' ? fileOrPath.path : fileOrPath
    goto(['archive', archive, 'file', path])
  }
}

export function FilePage (props) {
  const { archive, path, gotoFile } = fileRouteParams(props)
  return <File archive={archive} path={path} onSelect={gotoFile} />
}

export function FilePageWrapper (props) {
  const { children, router } = props
  const { archive, path, gotoFile } = fileRouteParams(router)
  return <FileWrapper children={children} archive={archive} path={path} onSelect={gotoFile} />
}

export function File (props) {
  const { archive, path, onSelect } = props
  const file = useFile(archive, path)
  if (file.error) return <Error error={file.error} />

  if (!file.path) return null

  if (file.isDirectory) {
    return <ListDir archive={archive} path={path} onSelect={onSelect} grid />
  } else {
    return <ViewFile archive={archive} path={path} stat={file} />
  }
}

export function FileWrapper (props) {
  const { children, archive, path, onSelect } = props
  return (
    <div>
      <div className='flex max-w-full'>
        <div className='flex-0 w-64 p-4 sm:hidden'>
          <ListDir archive={archive} path={path} onSelect={onSelect} focus />
        </div>
        <div className='flex-1 px-2 py-4'>
          {path && path !== '/' && (
            <div className='mb-4'>
              <Breadcrumb path={path} onSelect={onSelect} />
            </div>
          )}
          {children}
        </div>
        <div className='w-80 flex-0 p-4'>
          <Sidebar archive={archive} path={path} />
        </div>
      </div>
    </div>
  )
}

function Breadcrumb (props) {
  const { path, onSelect } = props
  const parts = useMemo(() => {
    let parts = path.split('/')
    return parts
  }, [path])
  let cls = 'cursor-pointer font-bold text-blue-dark inline-block'
  return (
    <div className='flex'>
      {parts.map((part, i) => {
        return (
          <div key={i} className='text-xl'>
            <span className={cls} onClick={onClick(i)}>
              {part}
            </span>
            {i !== (parts.length - 1) && <span className='mx-1 font-bold text-grey-dark'>/</span>}
          </div>
        )
      })}
    </div>
  )

  function onClick (i) {
    return e => {
      if (i === parts.length - 1) return
      onSelect(parts.splice(0, i + 1).join('/'))
    }
  }
}

function getFileActions (file) {
  let actions = getElements('archive/:archive/file').actions
  if (actions) {
    actions = actions.filter(action => {
      if (!action.match) return true
      else return action.match(file)
    })
  }
  return actions || []
}

function Action (props) {
  const { action, archive, path } = props
  // const [open, setOpen] = useState(false)
  let Icon = action.icon || null
  let Component = action.component || null
  // let clsWrapper = 'p-2 pl-0 rounded'
  // if (open) clsWrapper += ' bg-grey-lightest'
  let clsHeader = 'text-pink hover:text-pink-darkest 1 font-bold cursor-pointer flex'

  let actionLink = ({ onClick }) => (
    <div onClick={onClick} className={clsHeader}>
      { Icon && <Icon className='mr-1 w-8 flex-0' size={24} /> }
      <span className='self-center'>{action.name}</span>
    </div>
  )

  let modal = (
    <Modal Toggle={actionLink}>
      <div><Component archive={archive} path={path} /></div>
    </Modal>
  )

  return modal
}

function Sidebar (props) {
  const { archive, path } = props
  const file = useFile(archive, path)

  let actions = useMemo(() => getFileActions(file), [file])
  let renderedActions = null
  if (actions) {
    renderedActions = (
      <div>
        {actions.map((action, i) => <Action key={i} action={action} archive={archive} path={path} />)}
      </div>
    )
  }

  let widgets = null
  if (!file.isDirectory) widgets = <FileSidebar archive={archive} path={path} />

  return (
    <div className='px-4'>
      {renderedActions}
      {widgets}
    </div>
  )
}
