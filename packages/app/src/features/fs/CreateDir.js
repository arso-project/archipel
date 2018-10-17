import React from 'react'
import { Button, Foldable } from '@archipel/ui'

// TODO: Convert to ucore store.

class CreateDir extends React.Component {
  constructor () {
    super()
    this.state = { title: '' }
  }
  render () {
    const { archive, dir, onCreateDir } = this.props
    return (
      <Foldable heading='Create dir'>
        <div className='flex mb-2'>
          <span>Title: </span>
          <input type='text'
            className='p-1 border-2'
            onChange={(e) => this.setState({title: e.target.value})}
          />
          <Button onClick={(e) => this.state.title && onCreateDir({archive, dir, name: this.state.title})}>Create Dir</Button>
        </div>
      </Foldable>
    )
  }
}

export default CreateDir
