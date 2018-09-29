import { createSelector } from 'reselect'
import { apiAction } from '../../lib/rpc'
import { updateOrAdd, reduceAsyncAction, defaultAsyncState } from '../../redux-utils'

// The state slice and action name prefix.

const DIRLIST_LOAD = 'DIRLIST_LOAD'
const FILE_LOAD = 'FILE_LOAD'
const DIR_CREATE = 'DIR_CREATE'
const ARCHIVES_LOAD = 'ARCHIVES_LOAD'
const ARCHIVE_CREATE = 'ARCHIVE_CREATE'

// Selectors
export const selectArchives = state => state.archives.data
export const selectArchivesById = createSelector([selectArchives],
  (archives) => archives ? archives.reduce((ret, a) => Object.assign(ret, { [a.key]: a }), {}) : {}
)
export const selectArchiveById = (state, id) => {
  return selectArchivesById(state)[id] || null
}

export const selectDir = (state, { archive, dir }) => {
  const item = selectArchiveById(state, archive)
  if (item && item.dirs && item.dirs[dir]) return item.dirs[dir]
  return null
}

// Reducer
const reduceArchivesLoad = (state, action) => ({
  ...state,
  archives: reduceAsyncAction(state.archives, action)
})

const reduceArchiveCreate = (state, action) => ({
  ...state,
  archives: {
    pending: false,
    error: false,
    data: updateOrAdd(state.archives.data, () => false, action.payload[0])
  }
})

const reduceDirlistLoad = (state, action) => {
  const { key, dir } = action.meta
  const archive = selectArchiveById(state, key)
  if (!archive) return state // todo: this should never happen.
  const dirs = archive.dirs || {}
  const dirState = reduceAsyncAction(dirs[dir] || {}, action)
  return { ...state, archives: { ...state.archives, data: updateOrAdd(state.archives.data, item => item.key === key, { dirs: { ...dirs, [dir]: dirState } }) } }
}

const reduceFileLoad = (state, action) => {
  const { key, file } = action.meta
  const archive = selectArchiveById(state, key)
  const dirs = archive.dirs || {}
  const dirState = reduceAsyncAction(dirs[file] || {}, action)
  return { ...state, archives: { ...state.archives, data: updateOrAdd(state.archives.data, item => item.key === key, { dirs: { ...dirs, [file]: dirState } }) } }
}

const reducer = (state, action) => {
  if (!state.archives) state = { ...state, archives: defaultAsyncState([]) }

  switch (action.type) {
    case ARCHIVES_LOAD: return reduceArchivesLoad(state, action)
    case ARCHIVE_CREATE: return reduceArchiveCreate(state, action)
    case DIRLIST_LOAD: return reduceDirlistLoad(state, action)
    case FILE_LOAD: return reduceFileLoad(state, action)
  }
  return state
}

// Actions
export const createArchive = (title) => async dispatch => {
  const payload = { title }
  const action = {
    type: ARCHIVE_CREATE,
    payload
  }
  const res = await apiAction(action)
  dispatch(res)
}

export const createDir = ({archive, dir, name}) => async dispatch => {
  const payload = { id: archive, dir, name }
  const action = {
    type: DIR_CREATE,
    payload
  }
  const res = await apiAction(action)
  dispatch(res)
  // todo: add new only?
  dispatch(loadDirlist({archive, dir}))
}

export const loadDirlist = ({archive, dir}) => async dispatch => {
  // todo: fix ids/paths. archive to key is not good.
  const meta = { key: archive, dir }
  const action = {
    type: DIRLIST_LOAD,
    meta,
    pending: true
  }
  dispatch(action)
  const res = await apiAction(action)
  dispatch(res)
}

export const loadFile = (key, file) => async dispatch => {
  const meta = { key, file }
  const action = {
    type: FILE_LOAD,
    meta,
    pending: true
  }
  dispatch(action)
  const res = await apiAction(action)
  dispatch(res)
}

export const loadArchives = () => async (dispatch, getState) => {
  const state = getState()
  if (!state.workspace) return
  if (state.archives && !state.archives.data && !state.archives.pending) return
  const action = {
    type: ARCHIVES_LOAD,
    pending: true
  }
  const res = await apiAction(action)
  dispatch(res)
}

export default {
  reducer
}
