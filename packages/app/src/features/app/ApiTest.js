import React, { useState } from 'react'
import { useApi, Status, WithApi } from '../../lib/api.js'
import { useToggle } from '../../lib/hooks.js'
import { Button } from '@archipel/ui'

export default function ApiTest (props) {
  const [update, doUpdate] = useToggle()

  const state = useApi(async api => api.hyperlib.listArchives(), [update])

  if (!state.data) return <Status {...state} />

  const [api, list] = state.data

  console.log('list!', list)
  return (
    <div className='text-sm p-2 bg-teal-light'>
      apitest
      <Button onClick={e => makeArchive()}>Go</Button>
    </div>
  )

  async function makeArchive () {
    let res = await api.hyperlib.openArchive({ type: 'hyperdrive' })
    console.log('makeArchive res', res)
    doUpdate()
  }
}

