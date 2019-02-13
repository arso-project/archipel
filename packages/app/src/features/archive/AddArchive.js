import React from 'react'
import { Button, Input, Foldable, Checkbox } from '@archipel/ui'
import { Consumer } from 'ucore/react'

// TODO: improve Feedback, set Title, set shared Flag, preserve shared State at Archive Info

class AddArchiveWidget extends React.PureComponent {
  constructor () {
    super()
    this.state = {
      key: '',
      sparse: false
    }
    this.onAdd = this.onAdd.bind(this)
  }

  onAdd (e) {
    if (this.state.key) {
      this.props.onAdd(
        { key: this.state.key, sparse: this.state.sparse, type: 'hyperdrive' }
      )
      this.setState({ key: '' })
    }
  }

  render () {
    return (
      <Foldable heading='Add archive'>
        <Checkbox id='selectSparse' label='Sparse' info='If an Archive is set to sparse mode it downloads content only on request'
          onChange={(e) => this.setState({ sparse: e.target.checked })} />
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
      return <AddArchiveWidget onAdd={(key, opts) => addRemoteArchive(key, opts)} />
    }}
  </Consumer>
}

export default AddArchive

/*
  <Checkbox>Sparse
    <input type='checkbox' value='1' id='selectSparse' onChange={(e) => this.setState({ sparse: e.target.checked })} />
    <span className='checkmark' />
  </Checkbox>
*/
