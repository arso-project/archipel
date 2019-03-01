import React, { useState } from 'react'

import { Heading, Button, Status } from '@archipel/ui'

import { withApi } from '../../lib/api'
import { useAsyncEffect, useToggle, useForm } from '../../lib/hooks'
import { useRouter, Link } from '../../lib/router'
import { useArchive, discoToKey } from '../archive/archive'
// import { triplesToThings } from './store'
import { Metadata } from './Metadata'

import { makeLink, parseLink } from '@archipel/common/util/triples'
import { spo, triplesToThings, useQuery } from './triples'

export const TagSidebar = withApi(function TagSidebar (props) {
  const { archive: archiveKey, path, api } = props
  let archive = useArchive(archiveKey)
  // TODO: deal with structures properly.
  let structure = archive.structures[0]
  let link = makeLink(structure.discoveryKey, path)
  return (
    <div>
      <div className='mb-2'>
        <Metadata archive={archive} link={link} api={api} />
      </div>
      <TagWidget archive={archive} link={link} api={api} />
    </div>
  )
})

function TagWidget (props) {
  const { archive, link, api } = props
  const { key: archiveKey } = archive

  const [input, setInput] = useState('')
  const [saved, setSaved] = useToggle()

  return (
    <div>
      <Tags link={link} api={api} archive={archive} update={saved} />
      <form>
        <input
          placeholder='Tag...'
          className='p-2 border-black border font-xl'
          onChange={e => setInput(e.target.value)} type='text'
        />
        <Button type='submit' onClick={onSave}>OK</Button>
      </form>
    </div>
  )

  async function onSave (e) {
    e.preventDefault()
    let triples = []
    let prop = 'tag'
    triples.push(spo(link, prop, input))
    let res = await api.hypergraph.put(archiveKey, triples)
    setInput('')
    setSaved()
  }
}

function Tags (props) {
  const { archive, link, api, update } = props
  const { key: archiveKey } = archive
  let res = useAsyncEffect(async () => {
    let triples =  await api.hypergraph.get(archiveKey, { subject: link })
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

function TagItem (props) {
  let { tag, className } = props
  className = className || ''
  let cls = 'inline-block p-2 text-pink-dark font-bold ' + className
  let link = 'archive/:archive/tags/' + tag
  return (
    <Link link={link}>
      <div className={cls}><span className='text-grey italic'>#</span>{tag}</div>
    </Link>
  )
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

export const TagPage = withApi(function TagPage (props) {
  const { params } = props
  const { archive, tag } = params
  const result = useQuery(archive, { object: tag })
  if (!result.data) return <em>Tag {tag} not found.</em>
  let items = Object.keys(result.data)
  return <TagCard tag={tag} items={items} />
})

function TagCard (props) {
  const { tag, items } = props
  return (
    <div>
      <TagItem tag={tag} className='text-2xl' />
      <div className='flex flex-wrap'>
        {items.map((item, i) => <Subject key={i} link={item} />)}
      </div>
    </div>
  )
}

function Subject (props) {
  const TYPE = 'file' // todo.

  const { link } = props
  const { archiveKey, path } = resolveLink(link)
  const archive = useArchive(archiveKey)
  const result = useQuery(archiveKey, spo(link))
  if (!result.data) return null
  const entity = result.data[link]

  if (!entity) return null

  const filename = path.substring(path.lastIndexOf('/'))
  const title = getSingle(entity, 'title', filename)
  const desc = getSingle(entity, 'description', null)
  let meta = (
    <div>
      <em className='mr-2 bg-grey-lightest text-grey-dark w-64 truncate'>{archive.info.title}</em>
      {filename}
    </div>
  )

  return (
    <div className='lg:w-1/3 p-2'>
      <SubjectLink link={link}>
        <Card title={title} description={desc} meta={meta} />
      </SubjectLink>
    </div>
  )
}

function Card (props) {
  const { title, description, meta } = props
  return (
    <div className='lg:w-1/3 border-2 border-blue-dark'>
      <h2 className='text-lg text-blue-dark p-4 border-b-2 border-blue-dark'>
        {title}
      </h2>
      {description && <p className='p-4'>{description}</p>}
      <div className='text-s bg-grey-lightest px-4 py-2'>
        {meta}
      </div>
    </div>
  )
}

function getSingle (entity, prop, defaultValue) {
  if (entity[prop] && entity[prop][0]) return entity[prop][0]
  return defaultValue
}

function resolveLink (link) {
  let { key: discoveryKey, path } = parseLink(link)
  let archiveKey = discoToKey(discoveryKey)
  return { archiveKey, discoveryKey, path }
}

function SubjectLink (props) {
  const { link, children } = props
  const { goto } = useRouter()

  let { key: discoveryKey, path } = parseLink(link)
  let archiveKey = discoToKey(discoveryKey)

  let uiLink = ['archive', archiveKey, 'file', path]

  return (
    <a className='cursor-pointer' onClick={e => goto(uiLink)}>
      {children}
    </a>
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


