import { createSelector } from 'reselect'
import { sortByProps } from '../../lib/state-utils'

const initialState = {
  stats: {},
  ui: {}
}

const fetchStats = ({ archive, path }) => async (set, { core }) => {
  // set(draft => { draft.stats[id] = { pending: true } })
  // const { key, path } = splitId(id)
  const key = archive
  const res = await core.rpc.request('fs/stat', { key, path })
  set(draft => {
    res.stats.forEach(stat => {
      draft.stats[joinId(stat)] = stat
    })
  })
}

const createDir = ({ archive, parent, name }) => async (set, { core, actions }) => {
  try {
    let path = joinPath(parent, name)
    await core.rpc.request('fs/mkdir', { key: archive, path })
    actions.fetchStats({ archive, path: parent })
  } catch (err) {
    console.log('createDir error', err)
  }
}

const getChildren = (state, { archive, path }) => {
  let id = joinId({ key: archive, path })
  if (!state.stats[id]) return null
  if (!state.stats[id].children) return null
  let parent = state.stats[id]
  let ret = parent.children.map(name => {
    let childId = joinId({ path: joinPath(parent.path, name), key: parent.key })
    return state.stats[childId]
  })
  return ret
}

const getChildrenSortedByName = (state, { archive, path }) => {
  const list = getChildren(state, { archive, path })
  return sortByProps(list, ['isDirectory:desc', 'name'])
}

export default {
  initialState,
  actions: {
    fetchStats,
    createDir
  },
  select: {
    getChildren,
    getChildrenSortedByName
  }
}

function splitId (id) {
  const [ key, ...path ] = id.split('/')
  return { key, path: path.join('/') }
}

function joinId ({ key, path }) {
  if (path[0] === '/') path = path.substring(1)
  return key + '/' + path
}

function joinPath (prefix, suffix) {
  if (prefix.slice(-1) === '/') prefix = prefix.substring(0, prefix.length - 1)
  if (suffix[0] === '/') suffix = suffix.substring(1)
  return prefix + '/' + suffix
}
