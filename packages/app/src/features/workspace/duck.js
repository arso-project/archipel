// import rpc from '../../lib/rpc'
import { apiAction } from '../../lib/rpc'
import { defaultAsyncState, reduceAsyncAction, hasStarted } from '../../redux-utils'
import { loadArchives } from '../archive/duck'

// Action names
const WORKSPACE_OPEN = 'WORKSPACE_OPEN'
const WORKSPACE_CREATE = 'WORKSPACE_CREATE'
const WORKSPACES_LOAD = 'WORKSPACE_LIST'

// Actions
export const openWorkspace = key => (dispatch, getState) => {
  const state = getState()
  if (state.workspace && state.workspace.key === key) return
  // rpc(api => api.action({ type: WORKSPACE_OPEN, payload: key }, res => dispatch(res)))
  apiAction({ type: WORKSPACE_OPEN, payload: key })
    .then(res => {
      dispatch(res)
      dispatch(loadArchives())
    })
}

export const createWorkspace = title => async (dispatch, getState) => {
  const res = await apiAction({ type: WORKSPACE_CREATE, payload: { title } })
  dispatch(res)
  dispatch(loadWorkspaces())
  // const state = getState()
  // if (!state.workspace) {
  //   dispatch(loadWorkspaces())
  // }
}

export const loadWorkspaces = () => async (dispatch, getState) => {
  let state = getState()
  if (hasStarted(state.workspaces)) return
  const res = await apiAction({ type: WORKSPACES_LOAD })
  dispatch(res)
  state = getState()
  if (!state.workspace && res.payload.length) {
    dispatch(openWorkspace(res.payload[0].key))
  } else if (!res.payload.length) {
    dispatch(createWorkspace('Default workspace'))
  }
}

const reducer = (state, action) => {
  if (!state.workspaces) {
    state = { ...state,
      workspace: null,
      workspaces: defaultAsyncState([])
    }
  }
  switch (action.type) {
    case WORKSPACE_OPEN:
      // Also clear archives. Todo: should this live somewhere else?
      return { ...state, workspace: action.payload, archives: null }
    case WORKSPACES_LOAD:
      return { ...state, workspaces: reduceAsyncAction(state.workspaces, action) }
    // case WORKSPACE_CREATE:
    //   const workspaces = reduceAsyncAction(state.workspaces, action)
    //   return { ...state, workspaces: reduceAsyncAction(state.workspaces, action) }
  }
  return state
}

export default {
  reducer
}
