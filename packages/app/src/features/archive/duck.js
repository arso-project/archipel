import { createSelector } from 'reselect'
import { apiAction } from '../../lib/rpc'
import { updateOrAdd, reduceAsyncAction, defaultAsyncState, modifyData, sortByProp } from '../../redux-utils'

const KEY = 'archives'

const ARCHIVES_LOAD = 'ARCHIVES_LOAD'
const ARCHIVE_CREATE = 'ARCHIVE_CREATE'

// Selectors

export const select = {
  all: state => state[KEY],
  archivesByKey: state => createSelector(select.all, archives => archives.data.reduce((ret, a) => ({ ...ret, [a.key]: a }), {}))(state),
  archiveByKey: (state, { archive }) => select.archivesByKey(state)[archive],
  sortedByName: state => createSelector(select.all, archives => modifyData(archives, data => sortByProp(data, 'title')))(state)
}

// Reducer
const initialState = defaultAsyncState([])

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ARCHIVES_LOAD: return reduceAsyncAction(state, action)
    case ARCHIVE_CREATE: return reduceAsyncAction(state, action, updateOrAdd)
  }
  return state
}

// Actions
export const actions = {}

actions.createArchive = (title) => async dispatch => {
  const action = {
    type: ARCHIVE_CREATE,
    payload: { title }
  }
  dispatch(await apiAction(action))
}

actions.loadArchives = () => async (dispatch, getState) => {
  const state = getState()
  if (!state.workspace) return
  if (state.archives && !state.archives.data && !state.archives.pending) return
  const action = {
    type: ARCHIVES_LOAD,
    pending: true
  }
  dispatch(await apiAction(action))
}

export default {
  namespace: KEY,
  reducer
}
