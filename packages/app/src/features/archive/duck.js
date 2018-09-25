import { createSelector } from 'reselect'
import rpc from '../../lib/rpc'
import { updateOrAdd, reduceAsyncAction, defaultAsyncState } from '../../redux-utils'

// The state slice and action name prefix.

const DIRLIST_LOAD = 'DIRLIST_LOAD'
const ARCHIVES_LOAD = 'ARCHIVES_LOAD'

// Selectors
export const getArchives = state => state.archives.data
export const selectArchivesById = createSelector([getArchives],
  (archives) => archives ? archives.reduce((ret, a) => Object.assign(ret, { [a.key]: a }), {}) : {}
)
export const getArchiveById = (state, id) => {
  return selectArchivesById(state)[id] || null
}

export const selectDir = (state, id, dir) => {
  const archive = getArchiveById(state, id)
  if (archive && archive.dirs && archive.dirs[dir]) return archive.dirs[dir]
  return null
}

// Reducer
const reducer = (state, action) => {
  if (!state.archives) state = { ...state, archives: defaultAsyncState([]) }

  switch (action.type) {
    case ARCHIVES_LOAD:
      return { ...state, archives: reduceAsyncAction(state.archives, action) }
    case DIRLIST_LOAD:
      const { id, dir } = action.meta
      const archive = getArchiveById(state, id)
      const dirs = archive.dirs || {}
      const dirState = reduceAsyncAction(dirs[dir] || {}, action)
      return { ...state, archives: { ...state.archives, data: updateOrAdd(state.archives.data, id, { dirs: { ...dirs, [dir]: dirState } }) } }
  }
  return state
}

// Actions
export const loadDirlist = (id, dir) => dispatch => {
  const meta = { id, dir }
  dispatch({ type: DIRLIST_LOAD, meta: { ...meta, pending: true } })
  rpc(api => api.action({ type: DIRLIST_LOAD, meta }, res => dispatch(res)))
}

export const loadArchives = () => (dispatch, getState) => {
  const state = getState()
  if (!state.workspace) return
  if (state.archives && !state.archives.data && !state.archives.pending) return
  dispatch({ type: ARCHIVES_LOAD, meta: { pending: true } })
  rpc(api => api.action({ type: ARCHIVES_LOAD }, result => dispatch(result)))
}

export default {
  reducer
}
