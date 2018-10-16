const initialState = {
  stats: {}
}

const fetchStats = ({ id }) => async (set, { core }) => {
  set(draft => { draft.stats[id] = { pending: true } })
  const res = await core.rpc.request('fs/stats', { id })
  set(draft => {
    draft.stats[id].pending = false
    draft.stats[id].data = res.data
  })
}

const createDir = ({ parent, name }) => async (set, { core, actions }) => {
  try {
    const { id } = await core.rpc.request('fs/mkdir', { parent, name })
    actions.fetchStat({ id })
  } catch (err) {
    console.log('createDir error', err)
  }
}

const getChildren = (state, { id }) => {
  if (!state.stats[id]) return null
  if (!state.stats[id].children) return null
  return state.stats[id].children.map(id => state.stats[id])
}

export default {
  initialState,
  actions: {
    fetchStats,
    createDir
  },
  select: {
    getChildren
  }
}
