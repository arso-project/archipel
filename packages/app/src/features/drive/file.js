import React, { useState, useEffect, useMemo } from 'react'
import { getApi } from '../../lib/api'
import { sortByProps } from '../../lib/state-utils'

// const stores = {}

// function getStore (key) {
  // if (!stores[key]) {
    // stores[key] = {
      // files: {},
      // subscribers: {}
    // }
  // }
  // return stores[key]
// }

export function fileid (archive, path) {
  return `${archive}/${path}`
}

const files = {}
const subscribers = {}

export function watchFile (archive, path, cb, init) {
  let id = fileid(archive, path)
  subscribers[id] = subscribers[id] || []
  subscribers[id].push(cb)
  if (init) cb(getFile(archive, path))
}

export function unwatchFile (archive, path, cb) {
  let id = fileid(archive, path)
  if (!subscribers[id]) return
  subscribers[id] = subscribers[id].filter(fn => fn !== cb)
}

export function loadFile (archive, path, depth) {
  const id = fileid(archive, path)
  const file = getFile(archive, path)

  if (!file.data && !file.error) load()
  if (file.isDirectory && !file.children && depth) load()

  return file

  // if (file.started) {
    // return file
  // } else {
    // setFile(archive, path, { started: true, pending: true })
    // load()
    // return file
  // }

  async function load () {
    const api = await getApi()
    try {
      let data = await api.hyperdrive.stat(archive, path, depth)
      setFile(archive, path, data)
    } catch (error) {
      setFile(archive, path, { error })
    }
    if (subscribers[id]) subscribers[id].forEach(fn => fn(files[id]))
  }
}

function getFile (archive, path) {
  let id = fileid(archive, path)
  if (files[id]) return files[id]
  else {
    files[id] = {}
    return files[id]
  }
}

function setFile (archive, path, file) {
  let id = fileid(archive, path)
  file = file || {}
  if (file.children) {
    let children = file.children.map(child => setFile(archive, child.path, child))
    file.children = children
  }

  let oldfile = files[id] || {}
  files[id] = { 
    ...oldfile,
    ...file
  }

  return path
}

// export function useFileId (id, depth) {
  // let [archive, ...path] = id.split('/')
  // path = path.join('/')
  // return useFile(archive, path, depth)
// }
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
    paths.forEach(path => {
      watchFile(archive, path, watcher, true)
    })
    function watcher (file) {
      setState(state => ({ ...state, [file.path]: file }))
    }
    return () => {
      paths.forEach(path => unwatchFile(archive, path, watcher))
    }
  }, [archive, paths])

  const files = useMemo(() => {
    return sort(Object.values(state))
  }, [state])

  return files || []
}

function defaultSort (list) {
  return sortByProps(list, ['isDirectory:desc', 'name'])
}
