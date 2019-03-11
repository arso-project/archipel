import React, { useState, useEffect, useRef, useMemo, useContext } from 'react'
import { MdFolder, MdInsertDriveFile, MdExpandLess, MdExpandMore } from 'react-icons/md'

import { useFile, useFiles, loadFile } from './file'

export default function ListDir (props) {
  if (props.grid) return <FileGrid {...props} />
  else return <FileTree {...props} />
}

export function FileGrid (props) {
  const { archive, path, onSelect } = props
  const file = useFile(archive, path, 1)

  const children = useMemo(() => {
    if (!file.children || !file.children.length) return null
    let sorted = file.children.sort()
    return sorted.map((path, i) => <FileGridItem key={i} archive={archive} path={path} onSelect={onSelect} />)
  }, [file.children])

  if (!children) return <div className='text-xl italic text-grey-dark m-auto text-center'>This folder is empty.</div>

  return (
    <div>{children}</div>
  )
}

function useLoadFileChildren (archive, path, file) {
  useEffect(() => {
    // Load children if not yet loaded.
    if (file.isDirectory && !file.children) loadFile(archive, path, 1)
  }, [archive, file, path])
}

export function FileGridItem (props) {
  const { archive, path, onSelect } = props
  const file = useFile(archive, path, 1)
  useLoadFileChildren(archive, path, file)
  if (!file) return null
  let color = file.isDirectory ? 'blue' : 'grey-darkest'
  let Icon = fileIcon(file)
  let cls = `text-center float-left p-2 m-2 w-32 h-32 overflow-hidden 
      text-${color} hover:bg-grey-lighter rounded cursor-pointer`
  return (
    <div className={cls} onClick={e => onSelect(file.path)}>
      <div className='mb-1'><Icon size='64' /></div>
      {file.name}
    </div>
  )
}

export function FileLabel (props) {
  const { archive, path } = props
  const file = useFile(archive, path, 1)

  if (!file) return null

  let color = file.isDirectory ? 'blue' : 'grey-dark'
  let Icon = fileIcon(file)
  return (
    <span className={`max-w-64 text-${color} bg-blue-lightest rounded px-2`}><Icon /> {file.name}</span>
  )
}

export function FileTree (props) {
  let { archive, path, onSelect } = props

  const file = useFile(archive, '/', 2)

  if (!file) return null
  return (
    <FileTreeItem archive={archive} file={file} selected={path} onSelect={onSelect} />
  )
}

export function FileTreeItem (props) {
  let { archive, file, selected, onSelect } = props
  let path = file.path
  const [expand, setExpand] = useState(false)

  // TODO: extract into useTreeItemExpandedState() hook.
  const expanded = useMemo(() => {
    let base = selected.substring(0, selected.lastIndexOf('/')) || '/'
    if (base.startsWith(path)) return true
    return expand
  }, [expand, selected, path])

  useLoadFileChildren(archive, path, file)

  // todo: debug why the memo does not work.
  const treeChildren = useMemo(() => {
    if (!expanded) return null
    let cls = ''
    if (path !== '/') cls += 'pl-4'
    return (
      <div className={cls}>
        <FileTreeChildren archive={archive} paths={file.children} selected={selected} onSelect={onSelect} />
      </div>
    )
  }, [file.children, path, selected, expanded])

  if (!file) return null

  // special case for root folder.
  if (path === '/') return treeChildren

  let expandable = file.isDirectory
  let expander = (
    <div className='inline-block w-6 flex-0' onClick={e => setExpand(s => !s)}>
      {expandable && expand && <MdExpandLess />}
      {expandable && !expand && <MdExpandMore />}
    </div>
  )

  let Icon = fileIcon(file)
  let cls = itemClass(path === selected, false)
  if (expandable) cls += ' text-blue-dark '

  cls += ' flex overflow-hidden'

  return (
    <div>
      <div className={cls} onClick={e => onSelect(path)}>
        {expander}
        <span className='w-6 flex-0'><Icon /></span>
        <span className='truncate flex-1'>{file.name}</span>
      </div>
      {treeChildren}
    </div>
  )
}

function FileTreeChildren (props) {
  const { archive, paths, selected, onSelect } = props
  const files = useFiles(archive, paths)

  if (!paths || !paths.length) return null

  return (
    <div>
      {files.map((path, i) => {
        return <FileTreeItem key={i} archive={archive} file={path} selected={selected} onSelect={onSelect} />
      })}
    </div>
  )
}

function itemClass (select, focus, color) {
  let cls = ' cursor-pointer p-1 '
  cls += color ? 'text-' + color + ' ' : ''
  if (select) {
    cls += ' bg-blue-lighter '
  } else if (focus) {
    cls += ' bg-grey-lighter border-green border '
  } else {
    cls += ' '
  }
  return cls
}

function fileIcon (file) {
  let Icon = file.isDirectory ? MdFolder : MdInsertDriveFile
  return Icon
}

// export function FileItem (props) {
// const { archive, path, mode } = props
// const { goto } = useRouter()

// // TODO: Make sure that the goto array does not have to be repeated.
// function onSelect (path) {
// goto(['archive', archive, 'file', path])
// }

// if (mode === 'label') return <FileLabel {...props} onSelect={onSelect} />
// return <FileGridItem {...props} onSelect={onSelect} />
// }
