import React from 'react'
import { connect } from 'react-redux'
import { openWorkspace, loadWorkspaces } from './duck'
import Maybe from '../util/Maybe'

const SelectWorkspace = ({ workspaces, workspace, onSelect }) => {
  workspace = workspace ? workspace.key : undefined
  return <div className='flex text-xs'>
    <label>Chose Workspace</label>
    <select value={workspace} onChange={(e) => onSelect(e.target.value)}>
      { workspaces.map((ws, i) => <option key={i} value={ws.key}>{ws.title || ws.key}</option>)}
    </select>
  </div>
}

const mapState = (state, props) => {
  return {
    workspaces: state.workspaces,
    workspace: state.workspace
  }
}

export default connect(mapState)(class extends React.Component {
  componentDidMount () {
    this.props.dispatch(loadWorkspaces())
  }
  render () {
    const { workspaces, workspace, dispatch } = this.props
    return <Maybe {...workspaces}>
      {(workspaces) => <SelectWorkspace
        workspaces={workspaces}
        workspace={workspace}
        onSelect={key => dispatch(openWorkspace(key))} />}
    </Maybe>
  }
})
