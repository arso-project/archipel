import { useState, useEffect } from 'react'
import { getApi } from '../../lib/api'
import { Store } from '../../lib/store'

const archives = new Store('files')

init()

export function init () {
  getApi().then(api => go(api))

  async function go (api) {
    let archiveStream = await api.hyperlib.createArchiveStream(true)
    archiveStream.on('data', archive => {
      archives.set(archive.key, archive)
    })
    let networkStream = await api.hyperlib.createStatsStream()
    networkStream.on('data', data => {
      console.log('data', data)
    })
  }
}

export function getArchive (key) {
  return archives.get(key)
}

export function getArchives () {
  return archives.all()
}

export function useArchive (key) {
  const [state, setState] = useState(() => archives.get(key))
  useEffect(() => {
    archives.watch(key, watcher, true)
    return () => archives.unwatch(key, watcher)
    function watcher (archive) { setState(archive) }
  }, [key])
  return state || {}
}

export function useArchives () {
  const [state, setState] = useState(() => archives.all())
  useEffect(() => {
    archives.watchList(setState)
    return () => archives.unwatchList(setState)
  }, [])
  return state || []
}
