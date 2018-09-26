import React from 'react'
import { connect } from 'react-redux'
import { Heading, Button } from '@archipel/ui'

import { createDir } from './duck'

class CreateDir extends React.Component {
  constructor () {
    super()
    this.state = { title: '' }
  }
  render () {
    const { archive, dir, onCreateDir } = this.props
    return (
      <div className='p-4'>
        <Heading>Create Dir:</Heading>
        <div className='flex mb-2'>
          <span>Title: </span>
          <input type='text'
            className='p-1 border-2'
            onChange={(e) => this.setState({title: e.target.value})}
          />
        </div>
        <Button onClick={(e) => this.state.title && onCreateDir(archive, dir, this.state.title)}>Create Dir</Button>
      </div>
    )
  }
}

const mapState = (state, props) => ({
})

const mapDispatch = dispatch => ({
  onCreateDir: (archive, dir, title) => { dispatch(createDir(archive, dir, title)) }
})

export default connect(mapState, mapDispatch)(CreateDir)
