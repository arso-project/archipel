import React from 'react'
import { Heading, Button, Foldable, Input } from '@archipel/ui'
import { Consumer } from 'ucore/react'

import AddArchive from './AddArchive'

export default function NewArchive (props) {
  let wrapperCls = 'p-4 border-black border mb-4'
  return (
    <div>
      <div className={wrapperCls}>
        <h2 className='text-xl mb-2'>Create new archive</h2>
        <CreateArchiveWidget />
      </div>
      <div className={wrapperCls}>
        <h2 className='text-xl mb-2'>Add archive by key</h2>
        <AddArchive />
      </div>
    </div>
  )
}

class CreateArchiveWidget extends React.PureComponent {
  constructor () {
    super()
    this.state = { title: '' }
    this.onCreate = this.onCreate.bind(this)
  }

  onCreate (e) {
    if (this.state.title) {
      this.props.onCreate(this.state.title)
      this.setState({ title: '' })
    }
  }

  render () {
    return (
      <div>
        <div className='flex mb-4'>
          <Input placeholder='Title'
            onChange={(e) => this.setState({title: e.target.value})}
          />
        </div>
        <Button onClick={this.onCreate}>Create Archive</Button>
      </div>
    )
  }
}

const CreateArchive = () => {
  return <Consumer store='archive' select={state => null}>
    {(state, { createArchive }) => {
      return <CreateArchiveWidget onCreate={title => createArchive(title)} />
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
