import React from 'react'
import { connect } from 'react-redux'
import { openWorkspace, loadWorkspaces, selectWorkspace, selectWorkspaces, createWorkspace } from './duck'
import Maybe from '../util/Maybe'
import { Heading, Modal, Foldable, Button, List } from '@archipel/ui'

class CreateWorkspace extends React.Component {
  constructor () {
    super()
    this.state = { title: '' }
    this.onCreate = this.onCreate.bind(this)
  }

  onCreate (e) {
    if (this.state.title) {
      this.props.onCreate(this.state.title)
      this.setState({title: ''})
    }
  }

  render () {
    return (
      <React.Fragment>
        <input type='text' placeholder='Title' onChange={e => this.setState({title: e.target.value})} />
        <Button onClick={this.onCreate}>Create Workspace</Button>
      </React.Fragment>
    )
  }
}

const SelectWorkspace = ({ workspaces, workspace, onSelect, onCreate }) => {
  console.log(workspace)
  return <div className='flex text-xs'>
    { workspace && <span><em>{workspace.info.title}</em>&nbsp;</span> }
    <Modal toggle={props => <span {...props} className='cursor-pointer'>Change</span>}>
      {({toggle}) => (
        <React.Fragment>
          <Heading>Select Workspace</Heading>
          <List items={workspaces} onSelect={item => () => { onSelect(item.key); toggle() }}>
            {(item) => item.info.title.toString() || item.key}
          </List>
          <Foldable heading='Create Workspace'>
            <CreateWorkspace onCreate={onCreate} />
          </Foldable>
        </React.Fragment>
      )}
    </Modal>
  </div>
}

const mapStateToProps = (state, props) => {
  return {
    workspaces: selectWorkspaces(state),
    workspace: selectWorkspace(state)
  }
}

export default connect(mapStateToProps)(class extends React.Component {
  componentDidMount () {
    this.props.dispatch(loadWorkspaces())
  }
  render () {
    const { workspaces, workspace, dispatch } = this.props
    return <Maybe {...workspaces}>
      {(workspaces) => <SelectWorkspace
        workspaces={workspaces}
        workspace={workspace}
        onSelect={key => dispatch(openWorkspace(key))}
        onCreate={title => dispatch(createWorkspace(title))}
      />}
    </Maybe>
  }
})
