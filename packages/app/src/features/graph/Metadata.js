import React, { useState } from 'react'
import { Button, Status } from '@archipel/ui'
import { useAsyncEffect, useToggle, useForm } from '../../lib/hooks'
import { toObjects, toSubjects, spo } from './triples'

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

export function Metadata (props) {
  const { archive, link, api } = props
  const { key: archiveKey } = archive
  const [update, triggerUpdate] = useToggle()
  let res = useAsyncEffect(async () => {
    let triples = await api.hypergraph.get(archiveKey, spo(link))
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
    await api.hypergraph.put(archiveKey, triples)
    triggerUpdate()
  }
}

function MetadataEditor (props) {
  const { archive, link, api, data, onSubmit } = props
  const { state, setState, makeField, fieldProps, didChange } = useForm(data)
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
      {didChange && <Button type='submit'>Save</Button>}
    </form>
  )

  async function onSubmitForm (e) {
    e.preventDefault()
    console.log('form values', state)
    onSubmit(state)
  }
}
