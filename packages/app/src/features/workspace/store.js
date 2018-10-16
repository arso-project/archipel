const initialState = {
  pending: false,
  started: false,
  error: null,
  data: [],
  selected: null
}

const loadWorkspaces = () => async (set, { get, core, actions }) => {
  if (get().started) return
  set(draft => { draft.started = true; draft.pending = true })

  const res = await core.rpc.request('workspace/list')
  set(draft => { draft.data = res.data; draft.pending = false })

  if (!get().selected && res.data.length) {
    actions.openWorkspace(res.data[0].key)
  } else if (!res.data.length) {
    actions.createWorkspace('Default workspace')
  }
}

const openWorkspace = key => async (set, { get, core, actions }) => {
  if (get().selected === key) return

  try {
    let res = await core.rpc.request('workspace/open', { key })
    set(draft => { draft.selected = res.data.key })
  } catch (e) {
    console.log('WORKSPACE OPEN: ERROR', e) // todo
  }
}

const createWorkspace = title => async (set, { core, actions }) => {
  const res = await core.rpc.request('workspace/create', { info: { title } })
  actions.loadWorkspaces()
}

const actions = {
  loadWorkspaces,
  openWorkspace,
  createWorkspace
}

const select = {
  current (state) {
    if (!state.selected) return null
    else return state.data.filter(w => w.key === state.selected)[0]
  }
}

export default {
  initialState,
  actions,
  select
}
