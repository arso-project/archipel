import rpc from './../api/rpc'

import { openWorkspace, getWorkspaces } from './../api/workspace'

// Simple actions.

export const setTitle = title => ({ type: 'SET_TITLE', title })
export const setScreen = screen => ({ type: 'SET_UI_SCREEN', screen })
export const uiTree = (path, props) => ({ type: 'SET_UI_TREE', path, props })
export const uiSelectArchive = key => ({ type: 'UI_SELECT_ARCHIVE', key })

// Thunky actions.

export const query = (key, query) => (dispatch) => {
  const triples = []
  // rpc((api) => api.query(key, query, (err, rs) => {
  //   if (err) return
  //   rs.on('data', (triple) => triples.push(triple))
  //   rs.on('end', () => dispatch({ type: 'TRIPLES_LOAD', triples: triples }))
  // }))
}

export const loadWorkspaces = () => (dispatch) => {
  getWorkspaces((err, spaces) => {
    if (err) return
    dispatch({type: 'WORKSPACES_LOAD', workspaces: spaces})
  })
}

export const setWorkspace = (key) => (dispatch) => {
  dispatch({type: 'SET_WORKSPACE', workspace: key})
}

export const init = () => (dispatch, getState) => {
  getWorkspaces((err, spaces) => {
    if (err) return
    dispatch({type: 'WORKSPACES_LOAD', workspaces: spaces})
    var Workspace = openWorkspace(getState().workspace)
    Workspace.getArchives((err, archives) => {
      if (err) return
      dispatch({type: 'ARCHIVES_LOAD', archives: archives})
    })
  })
}

export const loadArchives = () => (dispatch, getState) => {
  var state = getState()
  if (!state.workspace) return
  var Workspace = openWorkspace(getState().workspace)
  Workspace.getArchives((err, archives) => {
    if (err) return
    dispatch({type: 'ARCHIVES_LOAD', archives: archives})
  })
}

export const createArchive = (title) => (dispatch, getState) => {
  var state = getState()
  var Workspace = openWorkspace(state.workspace)
  console.log('start create archive')
  Workspace.createArchive(title, (err, info) => {
    console.log('CREATE ARCHIVE!', err, info)
    dispatch({type: 'ARCHIVE_CREATED', archive: info})
  })
}
