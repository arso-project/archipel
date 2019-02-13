import React from 'react'
import { Button, Foldable } from '@archipel/ui'
import { Consumer } from 'ucore/react'

// TODO: Convert to ucore store.

class CreateDirWidget extends React.Component {
  constructor () {
    super()
    this.state = { title: '' }
    this.onCreate = this.onCreate.bind(this)
  }

  onCreate (e) {
    if (this.state.title) {
      this.props.onCreate({ archive: this.props.archive, parent: this.props.dir, name: this.state.title })
      this.setState({ title: '' })
    }
  }

  render () {
    return (
      <Foldable heading='Create dir'>
        <div className='flex mb-2'>
          <input type='text'
            className='p-1 border-2'
            placeholder='title'
            onChange={(e) => this.setState({ title: e.target.value })}
          />
          <Button onClick={this.onCreate}>Create Dir</Button>
        </div>
      </Foldable>
    )
  }
}

const CreateDir = (props) => {
  const { archive, dir } = props
  return <Consumer store='fs' select={state => null}>
    {(state, { createDir }) => {
      return <CreateDirWidget archive={archive} dir={dir} onCreate={createDir} />
    }}
  </Consumer>
}

export default CreateDir
