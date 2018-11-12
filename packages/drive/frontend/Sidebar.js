import React from 'react'
import RpcQuery from '@archipel/app/src/features/RpcQuery'
import { Consumer } from 'ucore/react'
import pretty from 'pretty-bytes'
import { Heading, Foldable } from '@archipel/ui'

function date (ts) {
  return ts
  let date = new Date(ts * 1000)
  return date.toISOString()
}

const Item = ({ name, children }) => (
  <div className='flex text-xs my-1 py-1 border-b'>
    <div className='flex-0 w-24'>{name}:</div>
    <div className='flex-1 font-bold'>{children}</div>
  </div>
)

const Stat = (props) => {
  const { stat, label } = props
  return (
    <div>
      <Item name='Name'>{label || stat.name}</Item>
      <Item name='Size'>{pretty(stat.size)}</Item>
      <Item name='Created'>{date(stat.ctime)}</Item>
      <Item name='Modified'>{date(stat.mtime)}</Item>
      {stat.seq && <Item name='History'>SEQ: <em>{stat.seq}</em> FEED: <em>{stat.feed}</em></Item>}
    </div>
  )
}

const SidebarWidget = (props) => {
  const { stat } = props
  return (
    <div className='p-2'>
      <Heading>{stat.name}</Heading>
      <Stat stat={stat} />
      <Heading>History</Heading>
      <RpcQuery {...props} fetch={props => ['fs/history', { key: props.archive, path: props.path }]}>
        {({ history }) => {
          return history.map((stat, i) => (
            <Foldable key={i} heading={'(' + stat.feed + ') ' + stat.seq}>
              <Stat stat={stat} />
            </Foldable>
          ))
        }}
      </RpcQuery>
      {props.children}
    </div>
  )
}

const Sidebar = (props) => {
  const { archive, path, setVersion } = props
  return (
    <Consumer store='fs' select='getStat' archive={archive} path={path}>
      {(stat, store) => {
        if (!stat || stat.isDirectory) return null
        let sidebarItems = store.core.components.getAll('fileSidebar')
        return (
          <div>
            <SidebarWidget {...props} stat={stat}>
              { sidebarItems && sidebarItems.map((item, i) => (
                <div key={i}>
                  <Heading>{item.opts.title}</Heading>
                  <item.component stat={stat} archive={archive} path={path} />
                </div>
              ))}
            </SidebarWidget>
          </div>
        )
      }}
    </Consumer>
  )
}

export default Sidebar
