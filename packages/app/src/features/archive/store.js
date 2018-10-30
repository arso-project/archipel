import { sortByProp } from '../../lib/state-utils'

const initialState = {
  archives: {},
  started: false,
  selected: null
}

/* Actions */

const createArchive = (title) => async (set, { get, core, actions }) => {
  let info = { title }
  await core.rpc.request('workspace/createArchive', { info })
  actions.loadArchives()
}

const loadArchives = () => async (set, { get, core }) => {
  set(draft => { draft.started = true; draft.archives = [] })
  const res = await core.rpc.request('workspace/listArchives')
  set(draft => {
    draft.archives = res.data
    if (draft.selected && !draft.archives[draft.selected]) {
      draft.selected = null
    }
  })
}

const shareArchive = (key, value) => async (set, { get, core, actions }) => {
  let res
  res = await core.rpc.request('workspace/shareArchive', { key: key, share: value })
  set(draft => { draft.archives[key] = res.data })
  return res
}

const selectArchive = (key) => (set) => {
  set(draft => { draft.selected = key })
}

const addRemoteArchive = (key) => async (set, { get, core, actions }) => {
  let res
  res = await core.rpc.request('workspace/addRemoteArchive', { key: key })
  actions.loadArchives()
  return res
}

/* Selectors */

const sortedByName = state => sortByProp(Object.values(state.archives), 'title')

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
    selectArchive,
    shareArchive,
    addRemoteArchive
  },
  select: {
    sortedByName,
    selectedArchive
  }
}
