import { apiAction } from '../../lib/rpc'
import { reduceAsyncAction } from '../../redux-utils'

// The state slice and action name prefix.

const KEY = 'fs'

const DIRLIST_LOAD = 'DIRLIST_LOAD'
// const FILE_LOAD = 'FILE_LOAD'
const DIR_CREATE = 'DIR_CREATE'

// Selectors
export const selectDir = (state, { archive, dir }) => {
  const id = archive + dir
  return state.fs[id] || null
}

// Reducer

const reduceDirlistLoad = (state, action) => {
  const { key, dir } = action.meta
  const id = key + dir
  const item = state[id] || {}
  const dirState = reduceAsyncAction(item, action)
  return { ...state, [id]: dirState }
}

const reducer = (state = {}, action) => {
  switch (action.type) {
    case DIRLIST_LOAD: return reduceDirlistLoad(state, action)
  }
  return state
}

// Actions
export const createDir = ({ archive, dir, name }) => async dispatch => {
  const payload = { id: archive, dir, name }
  const action = {
    type: DIR_CREATE,
    payload
  }
  dispatch(await apiAction(action))
  // todo: add new only?
  dispatch(loadDirlist({archive, dir}))
}

export const loadDirlist = ({ archive, dir }) => async dispatch => {
  // todo: fix ids/paths. archive to key is not good.
  const meta = { key: archive, dir }
  const action = {
    type: DIRLIST_LOAD,
    meta,
    pending: true
  }
  // dispatch(action)
  dispatch(await apiAction(action))
}

export default {
  namespace: KEY,
  reducer
}
