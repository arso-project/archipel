import { createSelector } from 'reselect'
import rpc, { apiAction } from '../../lib/rpc'
import { updateOrAdd, reduceAsyncAction, defaultAsyncState } from '../../redux-utils'

// The state slice and action name prefix.

const DIRLIST_LOAD = 'DIRLIST_LOAD'
const FILE_LOAD = 'FILE_LOAD'
const DIR_CREATE = 'DIR_CREATE'
const ARCHIVES_LOAD = 'ARCHIVES_LOAD'
const ARCHIVE_CREATE = 'ARCHIVE_CREATE'

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

  const dirListLoad = (state, action) => {
    const { key, dir } = action.meta
    const archive = getArchiveById(state, key)
    const dirs = archive.dirs || {}
    const dirState = reduceAsyncAction(dirs[dir] || {}, action)
    return { ...state, archives: { ...state.archives, data: updateOrAdd(state.archives.data, item => item.key === key, { dirs: { ...dirs, [dir]: dirState } }) } }
  }

  const fileLoad = (state, action) => {
    const { key, file } = action.meta
    const archive = getArchiveById(state, key)
    const dirs = archive.dirs || {}
    const dirState = reduceAsyncAction(dirs[file] || {}, action)
    return { ...state, archives: { ...state.archives, data: updateOrAdd(state.archives.data, item => item.key === key, { dirs: { ...dirs, [file]: dirState } }) } }
  }

  switch (action.type) {
    case ARCHIVES_LOAD:
      return { ...state, archives: reduceAsyncAction(state.archives, action) }
    case ARCHIVE_CREATE:
      // const archives = (state.archives && state.archives.data) ? state.archives.data : []
      return { ...state, archives: { pending: false, error: false, data: updateOrAdd(state.archives.data, () => false, action.payload[0]) } }
    case DIRLIST_LOAD: return dirListLoad(state, action)
    case FILE_LOAD: return fileLoad(state, action)
  }
  return state
}

// Actions
export const createArchive = (title) => async dispatch => {
  const res = await apiAction({ type: ARCHIVE_CREATE, payload: { title } })
  dispatch(res)
}

export const createDir = (archive, dir, name) => async dispatch => {
  const payload = { id: archive, dir, name }
  const res = await apiAction({ type: DIR_CREATE, payload })
  dispatch(res)
  // todo: add new only?
  dispatch(loadDirlist(archive, dir))
}

export const loadDirlist = (key, dir) => dispatch => {
  const meta = { key, dir }
  dispatch({ type: DIRLIST_LOAD, meta: { ...meta, pending: true } })
  rpc(api => api.action({ type: DIRLIST_LOAD, meta }, res => dispatch(res)))
}

export const loadFile = (key, file) => dispatch => {
  const meta = { key, file }
  dispatch({ type: FILE_LOAD, meta: { ...meta, pending: true } })
  rpc(api => api.action({ type: FILE_LOAD, meta }, res => dispatch(res)))
}

// const toApi = (actionName) => (...args) => dispatch => {
//   const meta = {...args}
//   dispatch({ type: actionName, meta: { ...meta, pending: true } })
//   rpc(api => api.action({ type: actionName, meta }, res => dispatch(res)))
// }

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
