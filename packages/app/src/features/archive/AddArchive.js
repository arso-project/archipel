import React from 'react'
import { Button, List, Foldable } from '@archipel/ui'
import { Consumer } from 'ucore/react'

const Archive = ({ item, selected }) => {
  return (
    <span>
      <strong>{item.title}</strong> <Key string={item.key} />
    </span>
  )
}

const Key = ({ string }) => (
  <strong className=''>
    {string.substring(0, 8)}…
  </strong>
)

class AddArchiveWidget extends React.PureComponent {
  constructor () {
    super()
    this.state = {
      started: false,
      pending: false,
      done: false
    }
  }

  onClick () {
    this.props.loadRemoteArchives()
    this.setState({
      started: true,
      pending: true
    })
  }

  render () {
    return (
      <Foldable heading='Add Archive' >
        <Button onClick={() => this.onClick()} >Load remote archives</Button>

        <List
          items={this.state.done ? this.props.remoteArchives : this.state.pending ? ['pending'] : this.state.started ? ['started'] : ['-']}
          // onSelect={this.props.onSelect}
          // selected={item => item.key === selected}
          // renderItem={item => <Archive item={item} />}
        />
      </Foldable>
    )
  }
}

const AddArchive = () => {
  return <Consumer store='archive' select={'remoteArchives'} >
    {(remoteArchives, { loadRemoteArchives }) => {
      return <AddArchiveWidget loadRemoteArchives={loadRemoteArchives} remoteArchives={remoteArchives} />
    }}
  </Consumer>
}

export default AddArchive
