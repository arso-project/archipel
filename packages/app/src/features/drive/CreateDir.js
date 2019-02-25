import React, { useState } from 'react'
import { Button, Foldable } from '@archipel/ui'

import { withApi } from '../../lib/api.js'
import { useResult } from '../../lib/result.js'

function CreateDir (props) {
  const { archive, path, api } = props
  const [name, setName] = useState('')
  const R = useResult()

  return (
    <Foldable heading='Create folder'>
      <div className='flex mb-2'>
        <input type='text'
          className='p-1 border-2'
          placeholder='name'
          onChange={(e) => setName(e.target.value)}
        />
        <Button onClick={onCreate}>Create folder</Button>
      </div>
      <R.Result />
    </Foldable>
  )

  async function onCreate () {
    if (!name) return
    // todo: validate name
    R.setPending()
    try {
      let newPath = path + '/' + name
      await api.hyperdrive.mkdir(archive, newPath)
      R.setSuccess('Directory created.')
    } catch (err) {
      R.setError(err)
    }
  }
}

export default withApi(CreateDir)
