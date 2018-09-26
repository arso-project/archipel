import React from 'react'
import { connect } from 'react-redux'
import { Heading, Button } from '@archipel/ui'

import { createArchive } from './duck'

class CreateArchive extends React.Component {
  constructor () {
    super()
    this.state = { title: '' }
  }
  render () {
    const { onCreateArchive } = this.props
    return (
      <div className='p-4'>
        <Heading>Create Archive</Heading>
        <div className='flex mb-2'>
          <span>Title: </span>
          <input type='text'
            className='p-1 border-2'
            onChange={(e) => this.setState({title: e.target.value})}
          />
        </div>
        <Button onClick={(e) => this.state.title && onCreateArchive(this.state.title)}>Create Archive</Button>
      </div>
    )
  }
}

const mapState = (state, props) => ({
})

const mapDispatch = dispatch => ({
  onCreateArchive: (title) => { dispatch(createArchive(title)) }
})

export default connect(mapState, mapDispatch)(CreateArchive)
