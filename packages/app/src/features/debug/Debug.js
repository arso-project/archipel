import React, { useState, useEffect } from 'react'
import { useApi, WithApi, withApi } from '../../lib/api.js'
import { useToggle, useKey } from '../../lib/hooks.js'
import { registerRoute, useRouter } from '../../lib/router.js'
import { Button, FloatingButton, List, Status } from '@archipel/ui'
import JSONTree from 'react-json-tree'


import { MdSettings } from 'react-icons/md'

import wayfarer from 'wayfarer'


export default function DebugPanel (props) {
  const [show, toggleShow] = useToggle(false)
  useKey('D', () => toggleShow())
  const toggle = (
    <div className={`fixed pin-b pin-r`}>
      <FloatingButton onClick={e => toggleShow()} icon={<MdSettings />} active={show} />
    </div>
  )

  if (!show) return toggle

  return (
    <div className='bg-grey-lightest p-4'>
      {toggle}
      <Debug />
    </div>
  )
}

function Debug (props) {
  // const { route, params } = useRouter()
  return (
    <div className='flex'>
      <DebugRoute />
    </div>
  )
}

function DebugRoute (props) {
  const { route, params } = useRouter()
  return (
    <div>
      <h4 className='p-0 m-0 text-base font-strong italic text-blue-dark'>Route</h4>
      <JSONTree 
        data={{route, params }} 
        invertTheme={true} theme='bright'
        shouldExpandNode={(keyName, data, level) => level < 2}
        hideRoot />
    </div>
  )
}

function Link (props) {
  // const ui = useUi()
  const { href, children } = props
  return (
    <a href={href} onClick={onClick}>{children}</a>
  )

  function onClick (e) {
    e.preventDefault()
    // let link = parseLink(href)
    ui.goto(href)
  }
}

// registerRoute('/archive', ArchiveScreen)
// registerRoute('/archive/:archive', ArchiveScreen)

function ArchiveScreen (props) {
  const { params } = props
  const { archive } = params
  return (
    <div className='m-4 p-4 border-pink border-2'>
      <h2>Archives!</h2>
      Selected: {archive}
    </div>
  )
}

function DebugOld () {
  // const ui = useUi()
  // let link = 'arso://835d28460c54eca33d3e093e73c12d2a22fb58650ceb9d55be361567d6e538e8/_wiki/index.md'
  let link = '/archive/hello'
  return (
    <div>
      <Link href={link}>index.md</link>
    </div>
  )
}

  // useEffect(() => {
    // const subrouter = wayfarer('/404')
    // // var r1 = wayfarer()
    // var r2 = wayfarer()
    // r2.on('/files', params => console.log('files!', params))
    // r2.on('/files/*', params => console.log('files!', params))

    // ui.router.on('/archive/:archive/index', params => console.log('ARCHIVE INDEX 1', params))
    // ui.router.on('/archive/:archive/index', params => console.log('ARCHIVE INDEX 2', params))
    // ui.router.on('/archive/:archive/apps', r2)
    // ui.router('archive/abc123/index')
    // ui.router('archive/abc123/apps/files/foo/bar')
    // ui.router('archive/abc123/apps/files')

    // ui.router.on('/archive/:archive', props => {
      // console.log('main MATCH', props)
    // })
    // ui.router.on('/archive/:archive/files', subrouter)
    // ui.router.on('/sub', subrouter)
    // ui.router.on('/404', props => console.log('main NOT FOUND', props))

    // subrouter.on('/foo/:path', props => console.log('sub MATCH', props))
    // subrouter.on('/404', props => console.log('sub NOT FOUND', props))
    // ui.router('/archive/foo')
    // ui.router('/archive/foo/files/foo/a/long/path')
    // ui.router('/archive/foo/fies/foo/a/long/path')
    // ui.router('/sub/foo/bar')
  // }, [])





