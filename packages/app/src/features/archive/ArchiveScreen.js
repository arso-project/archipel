import React, { useState, useEffect } from 'react'

import { MdMenu, MdClose, MdSubdirectoryArrowLeft } from 'react-icons/md'

import { Modal } from '@archipel/ui'

import { useToggle } from '../../lib/hooks'
import { useRouter, Link, getElements } from '../../lib/router'

import { useArchive } from './archive'

import ListArchives from './ListArchives'
import AuthorizationMenu from './AuthorizationMenu'
import CreateArchive from './CreateArchive'
import NetStats from './NetStatsComp'

export function ArchiveListWrapper (props) {
  const { children } = props
  const { params, goto, route, setParams } = useRouter()
  const { archive } = params

  return (
    <div className='flex flex-1'>
      <div className='flex-no-shrink w-65 mr-4'>
        <ArchiveGlobalActions />
        <ListArchives selected={archive} onSelect={onArchiveSelect} />
      </div>
      <div className='flex-1 p-4'>
        {children}
      </div>
    </div>
  )

  function onArchiveSelect (key) {
    goto('archive/' + key)
  }
}

export function NoArchive (props) {
  return (
    <div className='p-16 md:w-1/2 mx-auto my-auto'>
      <div className='my-8 text-center'>
        <img className='mr-6' src='/archipel-logo-1.svg' />
        <div className='text-5xl font-bold'>Archipel</div>
      </div>
      <div className='text-3xl text-grey italic text-center'>
        <span className='text-4xl'><MdSubdirectoryArrowLeft /></span>
        <br />
        No archive selected.
        <br />
        Chose or create an archive at the left!
      </div>
    </div>
  )
}

function ArchiveGlobalActions (props) {
  return (
    <>
      <div className='mb-4'>
        <Modal toggle='New archive'>
          <CreateArchive />
        </Modal>
      </div>
      <div className='mb-4'>
        <Modal toggle='Grant access'>
          <AuthorizationMenu />
        </Modal>
      </div>
    </>
  )
}

function ArchiveActions (props) {
  const { archive } = props
  let actions = getElements('archive').actions
  return (
    <div className='flex'>
      {actions.map((action, i) => (
        <Link key={i} link={action.href} params={{ archive }}>
          <ActionLink name={action.name} Icon={action.icon} />
        </Link>
      ))}
    </div>
  )
}

export function ActionLink (props) {
  let { Icon, name, color } = props
  color = color || 'pink'
  let clsHeader = `cursor-pointer flex text-lg text-${color} mx-2`
  return (
    <div className={clsHeader}>
      { Icon && <Icon className='mr-1 w-8 flex-0' size={24} /> }
      <span className='self-center'>{name}</span>
    </div>
  )
}

function ArchiveTabLinks () {
  const { route } = useRouter()

  let links = getElements('archive/:archive').link
  if (!links || !links.length) return null
  links = links.sort((a, b) => (a.weight || 0) > (b.weight || 0) ? 1 : -1)
  let color = 'pink'
  let lcls = `list-reset border-${color} border-r`

  return (
    <ul className={lcls}>
      {links.map((el, i) => <TabEl key={i} el={el} />)}
    </ul>
  )

  function TabEl (props) {
    const { el } = props
    let color = 'pink'
    let cls = `p-2 cursor-pointer text-${color}-dark`
    if (el.href === route || el.href + '/*' === route) cls += ` bg-${color}-lightest`
    else cls += ` hover:bg-${color}-lightest`
    return (
      <Link link={el.href}>
        <li className={cls}>
          {el.name}
        </li>
      </Link>
    )
  }
}

export function ArchiveTabsWrapper (props) {
  const { children, router } = props
  const { archive: archiveKey } = router.params
  const archive = useArchive(archiveKey)

  if (!archive.info) return children

  let color = 'pink'
  let cls = `border-${color} border flex bg-white`
  let hcls = `border-${color} border-b text-2xl m-0 px-2 py-4 text-${color} flex`

  return (
    <div className={cls}>
      <div className='flex-1'>
        <div className={hcls}>
          <h2 className='text-2xl flex-1'>
            {archive.info.title}
          </h2>
          <NetStats className='mr-2' archive={archive} />
          <div className=''>
            <ArchiveActions archive={archiveKey} />
          </div>
        </div>
        <div className='flex'>
          <ArchiveTabLinks />
          <div className='flex-1'>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

