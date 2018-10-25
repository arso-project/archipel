import React from 'react'
import { Button, List, Foldable } from '@archipel/ui'
import { Consumer } from 'ucore/react'

// TODO: improve Feedback, set Title, set shared Flag, preserve shared State at Archive Info

class AddArchiveWidget extends React.PureComponent {
  constructor () {
    super()
    this.state = { key: '',
      title: '' }
    this.onAdd = this.onAdd.bind(this)
  }

  onAdd (e) {
    if (this.state.key) {
      this.props.onAdd(this.state.key, this.state.title)
      this.setState({ key: '', title: '' })
    }
  }

  render () {
    return (
      <Foldable heading='Add archive'>
        <div className='flex mb-2'>
          <span>Key: </span>
          <input type='text' placeholder='Key'
            className='p-1 border-2'
            onChange={(e) => this.setState({ key: e.target.value })}
          />
        </div>
        <div className='flex mb-2'>
          <span>Title: </span>
          <input type='text' placeholder='Title'
            className='p-1 border-2'
            onChange={(e) => this.setState({ title: e.target.value })}
          />
        </div>
        <Button onClick={this.onAdd}>Add Archive</Button>
      </Foldable>
    )
  }
}

const AddArchive = () => {
  return <Consumer store='archive' select={state => null}>
    {(state, { addRemoteArchive }) => {
      return <AddArchiveWidget onAdd={title => addRemoteArchive(title)} />
    }}
  </Consumer>
}

export default AddArchive
