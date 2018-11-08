import { sortByProps } from '../../lib/state-utils'

const initialState = {
  stats: {},
  ui: {}
}

const fetchStats = ({ archive, path }) => async (set, { core }) => {
  const key = archive
  try {
    const res = await core.rpc.request('fs/stat', { key, path })
    set(draft => {
      res.stats.forEach(stat => {
        draft.stats[stat.key] = draft.stats[stat.key] || {}
        draft.stats[stat.key][stat.path] = stat
      })
    })
  } catch (e) {
    console.log('fetchStats error', e)
  }
}

const clearStats = ({ archive }) => async (set, { core }) => {
  set(draft => { draft.stats[archive] = undefined })
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

const getStat = (state, { archive, path }) => {
  const { stats } = state
  if (!stats[archive] || !stats[archive][path]) return undefined
  return stats[archive][path]
}

const getChildren = (state, { archive, path }) => {
  const { stats } = state
  if (!stats[archive] || !stats[archive][path]) return undefined
  if (!stats[archive][path].children) return stats[archive][path].children // can be either [] (no children) or undefined (not yet fetched)
  let parent = stats[archive][path]
  let ret = parent.children.map(name => {
    return stats[archive][joinPath(parent.path, name)]
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
    clearStats,
    createDir
  },
  select: {
    getStat,
    getChildren,
    getChildrenSortedByName
  }
}

function joinPath (prefix, suffix) {
  if (prefix.slice(-1) === '/') prefix = prefix.substring(0, prefix.length - 1)
  if (suffix[0] === '/') suffix = suffix.substring(1)
  return prefix + '/' + suffix
}
