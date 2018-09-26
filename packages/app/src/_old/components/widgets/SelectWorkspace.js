import React from 'react'
import { connect } from 'react-redux'
import { setWorkspace } from '../../actions'

const SelectWorkspace = ({workspaces, workspace, setWorkspace}) => {
  return <div className='flex text-bright text-xs'>
    <label>Chose Workspace</label>
    { (workspaces && workspace) && <select value={workspace} onChange={(e) => setWorkspace(e.target.value)}>
      { Object.keys(workspaces).map((ws) => <option key={ws} value={ws}>{workspaces[ws].title}</option>)}
    </select> }
  </div>
}

const mapStateToProps = (state, props) => {
  return {
    workspaces: state.workspaces,
    workspace: state.workspace
  }
}

const mapDispatchToProps = dispatch => ({
  setWorkspace: (workspace) => dispatch(setWorkspace(workspace))
})

export default connect(mapStateToProps, mapDispatchToProps)(SelectWorkspace)
