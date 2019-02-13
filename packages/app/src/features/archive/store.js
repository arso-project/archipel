import { sortByProp } from '../../lib/state-utils'

const initialState = {
  archives: {},
  started: false,
  selected: null
}

/* Actions */

const createArchive = (title) => async (set, { get, core, actions }) => {
  let opts = { type: 'hyperdrive', info: { title } }
  const res = await core.api.hyperlib.openArchive(opts)
  console.log(res)
  actions.loadArchives()
}

const loadArchives = () => async (set, { get, core }) => {
  // set(draft => { draft.started = true; draft.archives = [] })
  const res = await core.api.hyperlib.listArchives()
  console.log(res)
  set(draft => {
    draft.archives = res
    if (draft.selected && !draft.archives[draft.selected]) {
      draft.selected = null
    }
  })
}

const shareArchive = (key, value) => async (set, { get, core, actions }) => {
  // const res = await core.rpc.request('workspace/shareArchive', { key: key, share: value })
  let res
  if (value) res = await core.api.hyperlib.share(key)
  if (!value) res = await core.api.hyperlib.unshare(key)
  await set(draft => { draft.archives[key] = res })
  return res
}

const authorizeWriter = ({ key, writerKey }) => async (set, { get, core, actions }) => {
  let res
  res = await core.rpc.request('workspace/authorizeWriter', { key, writerKey })
  return res
}

const selectArchive = (key) => (set) => {
  set(draft => { draft.selected = key })
}

const addRemoteArchive = (opts) => async (set, { get, core, actions }) => {
  const res = await core.api.hyperlib.openArchive(opts)
  if (res) set(draft => { draft.archives[res.key] = res })
  // Or better:?
  // actions.loadArchives()
}

const writeNetworkStats = (req) => async (set, { get, core, actions }) => {
  set(draft => { draft.networkStats = req.data })
}

/* Selectors */

const sortedByName = state => sortByProp(Object.values(state.archives), 'title')

const selectedArchive = state => {
  // for (let i in state.archives) {
  //   if (state.archives[i].key === state.selected) return state.archives[i]
  // }
  return state.archives[state.selected]
}

const getNetworkStats = state => {
  if (!state.networkStats) return null
  return state.networkStats[state.selected]
}

loadArchives()

export default {
  initialState,
  actions: {
    createArchive,
    loadArchives,
    selectArchive,
    shareArchive,
    addRemoteArchive,
    writeNetworkStats,
    authorizeWriter
  },
  select: {
    sortedByName,
    selectedArchive,
    getNetworkStats
  }
}
