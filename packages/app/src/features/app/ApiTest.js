import React, { useState } from 'react'
import { useApi, WithApi, withApi, Status } from '../../lib/api.js'
import { useToggle } from '../../lib/hooks.js'
import { Button, List } from '@archipel/ui'

export default function ApiTest (props) {
  const [show, toggleShow] = useToggle(false)
  const toggle = (
    <div 
      className='absolute pin-t pin-r p-2'>
      <Button onClick={e => toggleShow()}>
        { show ? 'Hide' : 'ApiTest' }
      </Button>
    </div>
  )

  if (!show) return toggle

  return (
    <div className='bg-teal-lightest'>
      {toggle}
      <ApiTestHooks />
      <ApiTestHOC />
      <ApiTestWrapper />
    </div>
  )
}

export function ApiTestHooks (props) {
  const [update, doUpdate] = useToggle()

  const state = useApi(async api => api.hyperlib.listArchives(), [update])

  if (!state.data) return <Status {...state} />

  const [api, list] = state.data

  console.log('list!', list)
  return (
    <div className='text-sm p-2 bg-teal-light'>
      <Button onClick={e => makeArchive()}>Make archive</Button>
      <List items={list} renderItem={i => <pre>{JSON.stringify(i)}</pre>} />
    </div>
  )

  async function makeArchive () {
    const title = 'archive' + Math.floor(Math.random() * 100)
    let res = await api.hyperlib.openArchive({ type: 'hyperdrive', info: { title }})
    console.log('makeArchive res', res)
    doUpdate()
  }
}

// Use withApi to wrap a component. 
// The wrapped component will receive the api as a prop.
class ApiTestList extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      pending: true
    }
  }

  componentDidMount () {
    console.log(this.props)
    this.props.api.hyperlib.listArchives()
      .then(list => this.setState({ list }))
      .catch(error => this.setState({ error }))
  }

  render () {
    if (!this.state.list) return <Status {...this.state} />
    return (
      <List
        items={this.state.list}
        renderItem={item => <div>{JSON.stringify(item)}</div>}
      />
    )
  }
}
const ApiTestHOC = withApi(ApiTestList)

// Use WithApi to access the api in a render prop.
const ApiTestWrapper = props => (
  <WithApi>
    {api => (
      <div>
        Available api methods:
        {Object.keys(api).map(key => <div key={key}><strong>{key}:</strong> {Object.keys(api[key]).join(', ')}</div>)}
      </div>
    )}
  </WithApi>
)

