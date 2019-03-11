import React, { useEffect, useState, useRef } from 'react'
import { Button } from '@archipel/ui'
import { withApi } from '@archipel/app/src/lib/api'
import { registerElement, registerRoute } from '@archipel/app/src/lib/router'
import { useForm } from '@archipel/app/src/lib/hooks'
import { useArchive } from '@archipel/app/src/features/archive/archive'

import { startImportJob, getImportJob } from './importer'

export default function init () {
  registerElement('archive/:archive', {
    link: { name: 'Importer', href: 'archive/:archive/import', weight: 10 }
  })

  registerRoute(
    'archive/:archive/import',
    withApi(ImportPage),
    { wrap: true }
  )
}

function ImportPage (props) {
  const { params, api } = props
  const { archive: archiveKey } = params
  const archive = useArchive(archiveKey)
  return (
    <div className='p-4'>
      <Heading>Import</Heading>
      <Importer archive={archiveKey} api={api} />
    </div>
  )
}

function Importer (props) {
  const { archive, api } = props
  // const Wrapper = st.div`border-blue border-2 p-2`
  // const Wrapper = st('border-blue border-2 p-2')
  const [url, setUrl] = useState('')
  // const { state, itemProps } = useForm()
  const [jobId, setJobId] = useState(null)

  return (
    <div className='p-8'>
      hello
      <form>
        <UrlField placeholder='Enter URL' value={url} onChange={e => setUrl(e.target.value)} />
        <Button type='submit' onClick={onSubmit} />
      </form>
      { jobId && <ImportState id={jobId} /> }
    </div>
  )

  function onSubmit (e) {
    e.preventDefault()
    if (!url) return
    let job = startImportJob(url, archive, { api })
    setJobId(job.id)
    job.start()
  }
}

function ImportState (props) {
  const { id } = props
  const state = useImport(id)
  console.log('state', state)
  return (
    <div>
      { state.status && <em>status: <strong className='text-orange'>{state.status}</strong></em> }
      { state.messages && <Messages messages={state.messages} />}
    </div>
  )
}

function Messages (props) {
  let { messages } = props
  if (messages.length > 10) {
    messages = messages.slice(messages.length - 10)
  }
  return (
    <ul className=''>
      {messages.map((msg, i) => (
        <li key={i} className='display-block p-2 text-s'>
          {msg}
        </li>
      ))}
    </ul>
  )
}

function useImport (id) {
  const [state, setState] = useState(() => getImportJob(id).state)
  useEffect(() => {
    const job = getImportJob(id)
    job.watch(watcher, true)
    return () => job.unwatch(watcher)
    function watcher (job) { setState(job.state) }
    // function watcher (jobState, job) { setState(jobState) }
  }, [])
  return state
}

function UrlField (props) {
  let cls = 'display-block p-4 text-xl border-blue bg-blue-lightest'
  return <input className={cls} {...props} />
}

function Heading (props) {
  const { children } = props
  const cls = 'text-xl mb-2'
  return <h2 className={cls}>{children}</h2>
}

// function st (El, cls) {
  // if (!cls) return st('div', El)
  // return props => {
    // let classes = cls
    // if (props.className) classes += ' ' + props.className
    // return <El className={classes} {...props} />
  // }
// }
