import React from 'react'
import { Consumer } from 'ucore/react'
import { Heading, Modal, Foldable, Button, List, Input } from '@archipel/ui'

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
        <Input placeholder='Title' onChange={e => this.setState({title: e.target.value})} />
        <Button onClick={this.onCreate}>Create Workspace</Button>
      </React.Fragment>
    )
  }
}

const SelectWorkspaceWidget = ({ workspaces, workspace, onSelect, onCreate }) => {
  return <div className='flex'>
    { workspace && <span><em>{workspace.info.title}</em>&nbsp;</span> }
    <Modal toggle={props => <span {...props} className='cursor-pointer'>Change</span>}>
      {({ toggle }) => (
        <React.Fragment>
          <Heading>Select Workspace</Heading>
          <List items={workspaces} onSelect={item => () => { onSelect(item.key); toggle() }}>
            {(item) => item.info.title || item.key}
          </List>
          <Foldable heading='Create Workspace'>
            <CreateWorkspace onCreate={onCreate} />
          </Foldable>
        </React.Fragment>
      )}
    </Modal>
  </div>
}

const SelectWorkspace = () => {
  return <Consumer store='workspace' select={[s => s, 'current']}>
    {([state, current], { loadWorkspaces, openWorkspace, createWorkspace }) => {
      if (!state.started) loadWorkspaces()
      if (state.pending || !state.data || !state.data.length) return <div>No data</div>
      return <SelectWorkspaceWidget
        workspaces={state.data}
        workspace={current}
        onSelect={key => openWorkspace(key)}
        onCreate={title => createWorkspace(title)}
      />
    }}
  </Consumer>
}

export default SelectWorkspace

// const mapStateToProps = (state, props) => {
//   return {
//     workspaces: selectWorkspaces(state),
//     workspace: selectWorkspace(state)
//   }
// }

// export default connect(mapStateToProps)(class extends React.Component {
//   componentDidMount () {
//     this.props.dispatch(loadWorkspaces())
//   }
//   render () {
//     const { workspaces, workspace, dispatch } = this.props
//     return <Maybe {...workspaces}>
//       {(workspaces) => <SelectWorkspace
//         workspaces={workspaces}
//         workspace={workspace}
//         onSelect={key => dispatch(openWorkspace(key))}
//         onCreate={title => dispatch(createWorkspace(title))}
//       />}
//     </Maybe>
//   }
// })
