// import rpc from '../../lib/rpc'
import { apiAction } from '../../lib/rpc'
import { defaultAsyncState, reduceAsyncAction, hasStarted } from '../../redux-utils'
import { actions } from '../archive/duck'

const KEY = 'workspace'

// Action names
const WORKSPACE_OPEN = 'WORKSPACE_OPEN'
const WORKSPACE_CREATE = 'WORKSPACE_CREATE'
const WORKSPACES_LOAD = 'WORKSPACE_LIST'

export const selectWorkspace = (state) => {
  return state[KEY].selected
}

export const selectWorkspaces = (state) => {
  return state[KEY]
}

// Actions
export const openWorkspace = key => (dispatch, getState) => {
  const state = getState()
  if (state.workspace && state.workspace.key === key) return
  // rpc(api => api.action({ type: WORKSPACE_OPEN, payload: key }, res => dispatch(res)))
  apiAction({ type: WORKSPACE_OPEN, payload: key })
    .then(res => {
      dispatch(res)
      dispatch(actions.loadArchives())
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
  if (hasStarted(state[KEY])) return
  const res = await apiAction({ type: WORKSPACES_LOAD })
  dispatch(res)
  if (!selectWorkspace(getState()) && res.payload.length) {
    dispatch(openWorkspace(res.payload[0].key))
  } else if (!res.payload.length) {
    dispatch(createWorkspace('Default workspace'))
  }
}

// export const initialState = {
//   workspace: null,
//   workspaces: defaultAsyncState([])
// }

const initialState = defaultAsyncState([], {
  selected: null
})

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case WORKSPACE_OPEN:
      // Also clear archives. Todo: should this live somewhere else?
      return { ...state, selected: action.payload }
    case WORKSPACES_LOAD:
      return { ...reduceAsyncAction(state, action) }
    // case WORKSPACE_CREATE:
    //   const workspaces = reduceAsyncAction(state.workspaces, action)
    //   return { ...state, workspaces: reduceAsyncAction(state.workspaces, action) }
  }
  return state
}

export default {
  namespace: KEY,
  reducer
}
