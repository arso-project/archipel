import { sortByProp } from '../../lib/state-utils'

const initialState = {
  archives: []
}

/* Actions */

const createArchive = (title) => async (set, { get, core, actions }) => {
  let info = { title }
  await core.rpc.request('workspace/createArchive', { info })
  actions.loadArchives()
}

const loadArchives = () => async (set, { get, core }) => {
  set(draft => { draft.started = true })
  const res = await core.rpc.request('workspace/listArchives')
  set(draft => { draft.archives = res.data })
}

const shareArchive = (key) => async (set, { get, core, actions }) => {
  await core.rpc.request('workspace/shareArchive', { key: key })
  actions.loadArchives()
}

const loadRemoteArchives = () => async (set, { get, core }) => {
  let res = await core.rpc.request('workspace/loadRemoteArchives')
  set(draft => { draft.remoteArchives = res.data })
}

const selectArchive = (key) => (set) => {
  set(draft => { draft.selected = key })
}

/* Selectors */

const sortedByName = state => sortByProp([...state.archives], 'title')

const selectedArchive = state => {
  for (let i in state.archives) {
    if (state.archives[i].key === state.selected) return state.archives[i]
  }
}

const remoteArchives = state => {
  if (!state.remoteArchives) return null
  return state.remoteArchives
}

module.exports = {
  initialState,
  actions: {
    createArchive,
    loadArchives,
    selectArchive,
    shareArchive,
    loadRemoteArchives
  },
  select: {
    sortedByName,
    selectedArchive,
    remoteArchives
  }
}
