import React from 'react'
import pretty from 'pretty-bytes'
import { Heading, Foldable } from '@archipel/ui'

import { useApi, Status } from '../../lib/api.js'
import { useFile } from './file'

function date (isostring) {
  return isostring
}

const Item = ({ name, children }) => (
  <div className='flex text-xs my-1 py-1 border-b'>
    <div className='flex-0 w-24'>{name}:</div>
    <div className='flex-1 font-bold'>{children}</div>
  </div>
)

const Stat = (props) => {
  const { stat } = props
  return (
    <div>
      <Item name='Name'>{stat.name}</Item>
      <Item name='Size'>{pretty(stat.size)}</Item>
      <Item name='Created'>{date(stat.ctime)}</Item>
      <Item name='Modified'>{date(stat.mtime)}</Item>
      {stat.seq && <Item name='History'>SEQ: <em>{stat.seq}</em> FEED: <em>{stat.feed}</em></Item>}
    </div>
  )
}

function History (props) {
  const { file } = props
  const state = useApi(async api => api.hyperdrive.history(file.key, file.path), [file])
  if (!state.data) return <Status {...state} />
  const [api, history] = state.data

  const items = history.map((stat, i) => (
    <Foldable key={i} heading={'(' + stat.feed + ') ' + stat.seq}>
      <Stat stat={stat} />
    </Foldable>
  ))

  return <>{items}</>
}

const SidebarWidget = (props) => {
  const { file } = props
  return (
    <div className='p-2'>
      <Heading>{file.name}</Heading>
      <Stat stat={file} />
      <Heading>History</Heading>
      <History {...props} />
      {props.children}
    </div>
  )
}

export default function Sidebar (props) {
  const { archive, path, setVersion } = props
  const file = useFile(archive, path)
  if (!file.path) return null

  return (
    <>
      <SidebarWidget file={file} />
    </>
  )
}

// const Sidebar = (props) => {
  // const { archive, path, setVersion } = props
  // return (
    // <Consumer store='fs' select='getStat' archive={archive} path={path}>
      // {(stat, store) => {
        // if (!stat || stat.isDirectory) return null
        // let sidebarItems = store.core.components.getAll('fileSidebar')
        // return (
          // <div>
            // <SidebarWidget {...props} stat={stat}>
              // { sidebarItems && sidebarItems.map((item, i) => (
                // <div key={i}>
                  // <Heading>{item.opts.title}</Heading>
                  // <item.component stat={stat} archive={archive} path={path} />
                // </div>
              // ))}
            // </SidebarWidget>
          // </div>
        // )
      // }}
    // </Consumer>
  // )
// }

// export default Sidebar

