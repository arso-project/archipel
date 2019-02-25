import React, { useState } from 'react'

import { Heading, Button, Status } from '@archipel/ui'

import { withApi } from '../../lib/api'
import { useAsyncEffect, useToggle, useForm } from '../../lib/hooks'
import { useRouter } from '../../lib/router'
import { triplesToThings } from './store'

function makeFileLink (archive, path) {
  if (path.charAt(0) !== '/') path = '/' + path
  return 'arso://' + archive + path
}

function parseLink (str) {
  str = str.substring(7)
  let [key, ...path] = str.split('/')
  return { archive: key, path: path.join('/') }
}

function spo(s, p, o) {
  return { subject: s, predicate: p, object: o }
}

function TagItem (props) {
  let { tag, className } = props
  className = className || ''
  let cls = 'inline-block p-2 text-pink-dark font-bold ' + className
  return <div className={cls}><span className='text-grey italic'>#</span>{tag}</div>
}

function Tags (props) {
  const { archive, link, api, update } = props
  let res = useAsyncEffect(async () => {
    let triples =  await api.hypergraph.get(archive, { subject: link })
    let things = triplesToThings({}, triples)
    return things[link]
  }, [link, update])

  if (!res.data) return <Status {...res} />
  let item = res.data
  if (!item.tag || !item.tag.length) return 'No tags.'
  return (
    <div className='mb-2'>
      {res.data.tag.map((tag, i) => <TagItem key={i} tag={tag} />)}
    </div>
  )
}

function Sidebar (props) {
  const { archive, path, api } = props
  let link = makeFileLink(archive, path)
  return (
    <div>
      <Tag archive={archive} link={link} api={api} />
      <Metadata archive={archive} link={link} api={api} />
    </div>
  )
}

const FIELDS = {
  title: {
    label: 'Title',
    type: 'string'
  },

  description: {
    label: 'Description',
    type: 'text'
  }
}

function Metadata (props) {
  const { archive, link, api } = props
  const [update, triggerUpdate] = useToggle()
  let res = useAsyncEffect(async () => {
    let triples = await api.hypergraph.get(archive, spo(link))
    // console.log('load triples', triples)
    let subjects = toSubjects(triples)
    // console.log('load subjects', subjects)
    // console.log('load ret', subjects[link])
    return subjects[link] || {}
  }, [link, update])

  if (!res.data) return <Status {...res} />

  return <MetadataEditor {...props} data={res.data} onSubmit={onSubmit} />

  async function onSubmit (values) {
    let triples = []
    Object.keys(values).forEach(key => {
      triples.push(spo(link, key, values[key]))
    })
    // console.log('triples', triples)
    await api.hypergraph.put(archive, triples)
    triggerUpdate()
  }
}

function MetadataEditor (props) {
  const { archive, link, api, data, onSubmit } = props
  const { state, setState, makeField, fieldProps } = useForm(data)
  // console.log('editor', data)

  let els = []
  for (let [key, info] of Object.entries(FIELDS)) {
    els.push((
      <div key={key}>{makeField({ name: key, title: info.label })}</div>
    ))
  }
  return (
    <form onSubmit={onSubmitForm}>
      <div>
        {els}
      </div>
      <Button type='submit'>Save</Button>
    </form>
  )

  async function onSubmitForm (e) {
    e.preventDefault()
    console.log('form values', state)
    onSubmit(state)
    // onSubmit(formValues)
  }
}

function Tag (props) {
  const { archive, link, api } = props

  const [input, setInput] = useState('')
  const [saved, setSaved] = useToggle()

  return (
    <div>
      <Tags link={link} api={api} archive={archive} update={saved} />
      <input
        placeholder='Tag...'
        className='p-2 border-black border font-xl'
        onChange={e => setInput(e.target.value)} type='text'
      />
      <Button onClick={e => onSave()}>OK</Button>
    </div>
  )

  async function onSave () {
    console.log('save', input, api, props)
    let triples = []
    let prop = 'tag'
    triples.push(spo(link, prop, input))
    let res = await api.hypergraph.put(archive, triples)
    setInput('')
    setSaved()
  }
}

export const TagOverview = withApi(function TagOverview (props) {
  const { api } = props
  const { params } = useRouter()
  if (!params.archive) return
  let archive = params.archive

  let res = useAsyncEffect(async () => {
    let triples =  await api.hypergraph.get(archive, { predicate: 'tag' })
    let objects = toObjects(triples)
    return objects
  }, [archive])
  if (!res.data) return <Status {...res} />
  let objects = res.data

  let els = []
  for (let [tag, object] of Object.entries(objects)) {
    els.push(<TagCard key={tag} tag={tag} items={object.tag} />)
  }

  return (
    <div className='p-4'>
      <Heading size={4}>Tags</Heading>
      <div className=''>
        {els}
      </div>
    </div>
  )
})

function TagCard (props) {
  const { tag, items } = props
  return (
    <div>
      <TagItem tag={tag} className='text-2xl' />
      <div>
        {items.map((item, i) => <Subject key={i} link={item} />)}
      </div>
    </div>
  )
}

function Subject (props) {
  const { link, entity } = props
  const { goto } = useRouter()
  let parts = link.substring(7).split('/')
  let uiLink = ['archive', parts.shift(), 'file', parts.join('/')]
  return (
    <a className='display-block cursor-pointer' onClick={e => goto(uiLink)}>{link}</em>
  )
}

function toObjects (triples) {
  return triples.reduce((acc, t) => {
    acc[t.object] = acc[t.object] || {}
    acc[t.object][t.predicate] = acc[t.object][t.predicate] || []
    acc[t.object][t.predicate].push(t.subject)
    return acc
  }, {})
}

function toSubjects (triples) {
  if (!triples || !triples.length) return {}
  return triples.reduce((acc, t) => {
    acc[t.subject] = acc[t.subject] || {}
    acc[t.subject][t.predicate] = acc[t.subject][t.predicate] || []
    acc[t.subject][t.predicate].push(t.object)
    return acc
  }, {})
}

// function fill (object, keys) {
  // let cur = object
  // keys.forEach(key => {
    // cur[key] = cur[key] || {}
    // cur = cur[key]
  // })
// }

export default withApi(Sidebar)

