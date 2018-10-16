import React from 'react'
// import { connect } from 'react-redux'
import { Button, Foldable } from '@archipel/ui'
import { Consumer } from 'ucore/react'

// import { actions } from './duck'

class CreateArchiveWidget extends React.Component {
  constructor () {
    super()
    this.state = { title: '' }
  }

  onCreate (e) {
    if (this.state.title) {
      this.props.onCreate(this.state.title)
      //this.setState({title: ''})
    }
  }

  render () {
    return (
      <Foldable heading='Create archive'>
        <div className='flex mb-2'>
          <span>Title: </span>
          <input type='text' placeholder='Title'
            className='p-1 border-2'
            onChange={(e) => this.setState({title: e.target.value})}
          />
        </div>
        <Button onClick={this.onCreate}>Create Archive</Button>
      </Foldable>
    )
  }
}

const CreateArchiveWidgetTransmitter = ({ onCreate }) => {
  return <CreateArchiveWidget
    onCreate={title => onCreate}
  />
}

const CreateArchive = () => {
  return <Consumer store='archive'>
    {([state, current], { createArchive }) => {
      console.log('CREATE ARCHIVE', state, current)
      return <CreateArchiveWidgetTransmitter
        onCreate={title => createArchive(title)}
      />
    }}
  </Consumer>
}

/*
const mapState = (state, props) => ({
})

const mapDispatch = dispatch => ({
  onCreateArchive: (title) => dispatch(actions.createArchive(title))
})

export default connect(mapState, mapDispatch)(CreateArchive)
*/
export default CreateArchive
