import React, { useState, useEffect } from 'react'
import { useRouter } from '../../lib/router'
import { useApiCall } from '../../lib/api'
import JSONTree from 'react-json-tree'
import { MdExpandMore, MdExpandLess, MdVpnKey, MdCloud } from 'react-icons/md'
import pretty from 'pretty-bytes'

export default function ArchiveInfoFromRoute () {
  const { params } = useRouter()
  const { archive } = params
  if (!archive) return null
  return <ArchiveInfo archive={archive} />
}

export function ArchiveInfo (props) {
  const { archive } = props
  const state = useApiCall(async api => getArchiveInfo(api, archive))
  if (!state.data) return null
  let info = state.data

  return (
    <div>
      <div>
        {info.structures.map((s, i) => <Structure structure={s} key={i} /> )}
      </div>
      {/*<Json data={info} hideRoot />*/}
    </div>
  )
}

function Structure (props) {
  const { structure } = props
  const { type, key, writable, feeds } = structure
  const cls = 'p-2 m-2 border bg-grey-lightest'
  return (
    <div className={cls}>
      <div className='flex mb-2'>
        <Key name={key} />
        <div className='mx-2'><strong>{type}</strong></div>
        <div>{ writable && <MdVpnKey /> }</div>
      </div>
      <div>
        { feeds && feeds.map((feed, i) => <Feed key={i} feed={feed} /> )}
      </div>
    </div>
  )
}

function Feed (props) {
  const { feed } = props
  const { key, writable, type, length, byteLength } = feed
  let cls = 'p-2 border border-teal bg-teal-lightest text-teal-dark text-s mb-1'
  let d = c => <span className='inline-block mr-2'>{c}</span>
  return (
    <div className={cls}>
      {d(keystr(key))}
      {d(<em>{type}</em>)} 
      {d(<>length: <strong>{length}</strong></>)}
      {d(<>size: <strong>{pretty(byteLength)}</strong></>)}
      {d(<>{writable && <MdVpnKey />}</>)}
    </div>
  )
}


function Key (props) {
  const { name } = props
  return (
    <span>{keystr(name)}</span>
  )
}

function keystr (key) {
  return key.substring(0, 5)
}

function Json (props) {
  const { data, hideRoot } = props
  return (
    <JSONTree 
      data={data} 
      invertTheme={true}
      theme='bright'
      shouldExpandNode={(keyName, data, level) => level < 2}
      hideRoot={hideRoot} />
  )
}

let info = null
async function getArchiveInfo (api, key) {
  if (!info) {
    console.log('prereq')
    info = true
    info = await api.hyperlib.listArchives()
    console.log('REQUEST', key, api, info)
  }
  return info[key]
}
