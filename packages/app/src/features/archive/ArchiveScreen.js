import React, { useState, useEffect } from 'react'

import { MdMenu, MdClose, MdSubdirectoryArrowLeft } from 'react-icons/md'
import { Tabs, Heading } from '@archipel/ui'
import { Consumer } from 'ucore/react'

import registry from '../../lib/component-registry.js'
import { useToggle } from '../../lib/hooks.js'

import ListArchives from './ListArchives'
import CreateArchive from './CreateArchive'
import AddArchive from './AddArchive'

export default function ArchiveScreen (props) {
  const { params, goto } = props

  // todo: Change onSelect syntax in List to be a single function.
  return <ArchiveUcoreLoader Render={ArchiveScreen} changeprop={params.archive} />

  function ArchiveScreen (props) {
    const { archives, selected, onSelect } = props

    useEffect(() => {
      if (params.archive !== archive) onSelect(params.archive)
    }, [params.archive])

    const archive = selected ? selected.key : null

    return (
      <div className='flex flex-1'>
        <div className='flex-no-shrink w-65'>
          <ArchiveList archives={archives} selected={selected} onSelect={onArchiveSelect} />
        </div>
        <div className='flex-1 p-4'>
          { !archive && <NoArchive /> }
          { archive && <ArchiveAppScreen archive={archive} loadedArchive={selected} /> }
        </div>
      </div>
    )

    function onArchiveSelect (item, i) {
      return (e) => {
        onSelect(item.key)
        goto('archive/' + item.key)
      }
    }
  }
}

function NoArchive (props) {
  return (
    <div className='p-16 text-3xl text-grey italic text-center leading-loose md:w-1/2 mx-auto my-auto'>
      <span className='text-4xl'><MdSubdirectoryArrowLeft /></span>
      <br />
      No archive selected.
      <br />
      Chose or create an archive at the left!
    </div>
  )
}

function ArchiveList (props) {
  const { archives, selected, onSelect } = props
  return (
    <>
      <CreateArchive />
      <AddArchive />
      <ListArchives
        archives={archives}
        isSelected={item => item === selected}
        onSelect={onSelect}
      />
    </>
  )
}

function ArchiveAppScreen (props) {
  const { archive, loadedArchive } = props

  const [tab, setTab] = useState(0)
  const [menu, toggleMenu] = useToggle(true)

  let tabs = registry.getAll('archiveTabs').map(mapRegisteredToTabs)
  let TabComponent = tabs[tab].component

  let color = 'pink'
  let cls = `border-${color} border flex`
  let hcls = `border-${color} border-b text-2xl m-0 px-2 py-4 text-${color}`
  let lcls = `list-reset border-${color} border-r`

  let MenuIcon = menu ? MdClose : MdMenu

  return (
    <div className={cls}>
      {menu && <TabList />}
      <div className='flex-1'>
        <h2 className={hcls}>
          <span onClick={e => toggleMenu()} className='cursor-pointer'><MenuIcon /></span>
          {loadedArchive.info.title}
        </h2>
        <TabComponent archive={archive} />
      </div>
    </div>
  )

  function TabList () {
    return (
      <ul className={lcls}>
        {tabs.map((info, i) => {
          let cls = `p-2 cursor-pointer text-${color}-dark`
          if (i === tab) cls += ` bg-${color}-lightest` 
          else cls += ` hover:bg-${color}-lightest`
          return <li key={i} className={cls} onClick={e => setTab(i)}>{info.title}</li>
        })}
      </ul>
    )
  }
}

function AppScreenWrapper (props) {
  const { loadedArchive, color, children } = props
  let cls = `border-${color} border-l`
  let hcls = `border-${color} border-b text-2xl m-0 px-2 py-4 text-${color}`
  return (
    <div className={cls}>
      <h2 className={hcls}>{loadedArchive.info.title}</h2>
      {children}
    </>
  )
}

function ArchiveUcoreLoader (props) {
  const { Render, ...rest } = props
  return (
    <Consumer store='archive' select={['sortedByName', 'selectedArchive']} {...rest}>
      {([archives, selectedArchive], store) => {
        if (!store.get().started) store.loadArchives()
        return <Render archives={archives} selected={selectedArchive} onSelect={store.selectArchive} />
      }}
    </Consumer>
  )
}

function mapRegisteredToTabs (item) {
  return { title: item.opts.title, component: item.component }
}
