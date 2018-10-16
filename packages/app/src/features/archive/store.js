import { sortByProp } from '../../redux-utils'

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

const sortedByName = state => {
  // return state.archives
  return sortByProp([...state.archives], 'title')
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
