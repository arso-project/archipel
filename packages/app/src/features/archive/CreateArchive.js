import React from 'react'
import { connect } from 'react-redux'
import { Button, Foldable } from '@archipel/ui'

import { createArchive } from './duck'

class CreateArchive extends React.Component {
  constructor () {
    super()
    this.state = { title: '' }
  }
  render () {
    const { onCreateArchive } = this.props
    return (
      <Foldable heading='Create archive'>
        <div className='flex mb-2'>
          <span>Title: </span>
          <input type='text'
            className='p-1 border-2'
            onChange={(e) => this.setState({title: e.target.value})}
          />
        </div>
        <Button onClick={(e) => this.state.title && onCreateArchive(this.state.title)}>Create Archive</Button>
      </Foldable>
    )
  }
}

const mapState = (state, props) => ({
})

const mapDispatch = dispatch => ({
  onCreateArchive: (title) => dispatch(createArchive(title))
})

export default connect(mapState, mapDispatch)(CreateArchive)
