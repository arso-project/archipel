import { modifyData, sortByProp } from '../../redux-utils'
import { createSelector } from 'reselect'

const initialState = {
  archives: []
}

const createArchive = (title) => async (set, { get, core }) => {
  const res = await core.rpc.request('workspace/createArchive')
  console.log('RES', res)
  loadArchives()
}

const loadArchives = () => async (set, { get, core }) => {
  if (get().started) return
  set(draft => { draft.started = true })
  const res = await core.rpc.request('workspace/listArchives')
  console.log('RES(loadArchives)', res)
  set(draft => { draft.archives = res.data })
}

const sortedByName = state => {
  console.log('STATE', state)
  return state.archives
  // return sortByProp(state.archives, 'title')
  // return createSelector(state.archives, archives => modifyData(archives, data => sortByProp(data, 'title')))(state)
}

module.exports = {
  initialState,
  actions: {
    createArchive,
    loadArchives
  },
  select: {
    sortedByName
  }
}
