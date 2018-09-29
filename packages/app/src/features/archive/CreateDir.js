import React from 'react'
import { connect } from 'react-redux'
import { Button, Foldable } from '@archipel/ui'

import { createDir } from './duck'

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

const mapState = (state, props) => ({
})

const mapDispatch = dispatch => ({
  onCreateDir: ({archive, dir, name}) => { dispatch(createDir({archive, dir, name})) }
})

export default connect(mapState, mapDispatch)(CreateDir)
