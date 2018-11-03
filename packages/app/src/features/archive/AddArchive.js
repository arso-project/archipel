import React from 'react'
import { Button, Input, Foldable } from '@archipel/ui'
import { Consumer } from 'ucore/react'

// TODO: improve Feedback, set Title, set shared Flag, preserve shared State at Archive Info

class AddArchiveWidget extends React.PureComponent {
  constructor () {
    super()
    this.state = { key: '' }
    this.onAdd = this.onAdd.bind(this)
  }

  onAdd (e) {
    if (this.state.key) {
      this.props.onAdd(this.state.key)
      this.setState({ key: '' })
    }
  }

  render () {
    return (
      <Foldable heading='Add archive'>
        <div className='flex mb-4'>
          <Input placeholder='Key'
            onChange={(e) => this.setState({ key: e.target.value })}
          />
        </div>
        <Button className='w-full' onClick={this.onAdd}>Add Archive</Button>
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
