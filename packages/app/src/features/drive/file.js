import { useState, useEffect, useMemo } from 'react'
import { getApi } from '../../lib/api'
import { StatefulStore } from '../../lib/store'
import { sortByProps } from '../../lib/state-utils'

const files = new StatefulStore('files')

export function init () {
  files.reset()

  // Start watch stream.
  getApi().then(api => go(api))
  async function go (api) {
    let watchStream = await api.hyperdrive.createWatchStream()
    // todo: this is really inefficient.
    watchStream.on('data', info => {
      let ids = files.ids()
      const keys = ids.filter(id => id.split('/')[0] === info.key)
      // keys.forEach(key => files.set(key, () => ({})))
      // loadFile(info.key, '/')
    })
  }
}

export function fileid (archive, path) {
  return `${archive}/${path}`
}

export function watchFile (archive, path, cb, init) {
  let id = fileid(archive, path)
  files.watch(id, cb, init)
}

export function unwatchFile (archive, path, cb) {
  let id = fileid(archive, path)
  files.unwatch(id, cb)
}

export function loadFile (archive, path, depth) {
  const id = fileid(archive, path)

  const file = files.get(id)

  if (!file.path && !file.error) load()
  else if (file.isDirectory && !file.children && depth) load()

  return file

  async function load () {
    const fstate = files.getState(id)
    if (fstate.fetching) return
    files.setState(id, { fetching: true }, true)

    const api = await getApi()
    try {
      let file = await api.hyperdrive.stat(archive, path, depth)
      file = setChildren(file)

      files.setState(id, { fetching: false }, true)
      files.set(id, file)
    } catch (error) {
      files.setState(id, { fetching: false }, true)
      files.set(id, { error })
    }
  }

  function setChildren (file) {
    if (!file.children) return file
    let children = file.children.map(child => {
      let childid = fileid(archive, child.path)
      if (child.children) child = setChildren(child)
      files.set(childid, child)
      return child.path
    })
    file.children = children
    return file
  }
}

export function getFile (archive, path) {
  let id = fileid(archive, path)
  return files.get(id)
}

export function setFile (archive, path, file) {
  let id = fileid(archive, path)
  files.set(id, file)
}

export function useFile (archive, path, depth) {
  const [state, setState] = useState(() => loadFile(archive, path, depth))
  useEffect(() => {
    watchFile(archive, path, watcher, true)
    function watcher (file) {
      setState(file)
    }
    return () => unwatchFile(archive, path, watcher)
  }, [archive, path, depth])
  return state || {}
}

export function useFiles (archive, paths, sort) {
  const [state, setState] = useState({})
  sort = sort || defaultSort
  paths = paths || []

  useEffect(() => {
    let _unmount = false
    paths.forEach(path => {
      watchFile(archive, path, watcher, true)
    })
    function watcher (file) {
      if (_unmount) return
      setState(state => ({ ...state, [file.path]: file }))
    }
    return () => {
      _unmount = true
      paths.forEach(path => unwatchFile(archive, path, watcher))
    }
  }, [archive, paths])

  const files = useMemo(() => {
    return sort(Object.values(state))
  }, [state])

  return files || []
}

export function defaultSort (list) {
  return sortByProps(list, ['isDirectory:desc', 'name'])
}
