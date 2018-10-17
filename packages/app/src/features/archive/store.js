import { sortByProp } from '../../lib/state-utils'

const initialState = {
  archives: []
}

const createArchive = (title) => async (set, { get, core, actions }) => {
  let info = { title }
  const res = await core.rpc.request('workspace/createArchive', { info })
  console.log('RES', res)
  actions.loadArchives()
}

const loadArchives = () => async (set, { get, core }) => {
  set(draft => { draft.started = true })
  const res = await core.rpc.request('workspace/listArchives')
  set(draft => { draft.archives = res.data })
}

const selectArchive = (key) => (set) => {
  set(draft => { draft.selected = key })
}

const sortedByName = state => {
  // return state.archives
  return sortByProp([...state.archives], 'title')
  // return createSelector(state.archives, archives => modifyData(archives, data => sortByProp(data, 'title')))(state)
}

const selectedArchive = state => {
  for (let i in state.archives) {
    if (state.archives[i].key === state.selected) return state.archives[i]
  }
}

module.exports = {
  initialState,
  actions: {
    createArchive,
    loadArchives,
    selectArchive
  },
  select: {
    sortedByName,
    selectedArchive
  }
}
