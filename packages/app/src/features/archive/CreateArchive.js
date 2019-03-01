import React from 'react'
import { Button, Input, Checkbox } from '@archipel/ui'
import { useForm } from '../../lib/hooks'
import { getApi } from '../../lib/api'
import { useMessage } from '../../lib/message'

const TYPE = 'hyperdrive'

export default function NewArchive (props) {
  return (
    <>
      <div className='border p-4 mb-4'>
        <Heading>Create archive</Heading>
        <CreateArchive />
      </div>
      <div className='border p-4'>
        <Heading>Add archive</Heading>
        <AddArchive />
      </div>
    </>
  )
}

export function AddArchive (props) {
  const { state, itemProps, checkboxItemProps } = useForm()
  const { push, Messages } = useMessage()
  return (
    <form>
      <Messages />
      <Checkbox id='selectSparse' label='Sparse' info='If an Archive is set to sparse mode it downloads content only on request'
        {...checkboxItemProps('sparse', false)}
      />
      <div className='flex'>
        <Input className='w-2/3 mr-2' {...itemProps('key', '')} />
        <Button type='submit' onClick={onSubmit}>Add Archive</Button>
      </div>
    </form>
  )

  async function onSubmit (e) {
    e.preventDefault()
    const api = await getApi()
    try {
      await api.hyperlib.openArchive({ type: TYPE, key: state.key, sparse: !!state.sparse })
      push('success', 'Archive added.')
    } catch (e) {
      push('error', e)
    }
  }
}

export function CreateArchive (props) {
  const { state, itemProps } = useForm()
  const { push, Messages } = useMessage()
  return (
    <form>
      <Messages />
      <div className='flex'>
        <Input className='w-2/3 mr-2' {...itemProps('title', '')} />
        <Button type='submit' onClick={onSubmit}>Create Archive</Button>
      </div>
    </form>
  )

  async function onSubmit (e) {
    e.preventDefault()
    if (!state.title) return
    let info = { title: state.title }
    const api = await getApi()
    try {
      await api.hyperlib.openArchive({ type: TYPE, info })
      push('success', 'Archive added.')
    } catch (e) {
      push('error', e)
    }
  }
}

function Heading (props) {
  const { children } = props
  let cls = 'text-xl mb-4'
  return (
    <h2 className={cls}>{children}</h2>
  )
}
