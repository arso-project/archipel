import { useState, useEffect } from 'react'
import { getApi } from '../../lib/api'
import { Store } from '../../lib/store'

let archives = new Store('files')

export function init () {
  // Reset.
  archives.reset()

  // Open archive stream.
  getApi().then(api => go(api))
  async function go (api) {
    let archiveStream = await api.hyperlib.createArchiveStream(true)
    archiveStream.on('data', archive => {
      archives.set(archive.key, archive)
    })
  }
}

export function getArchive (key) {
  return archives.get(key)
}

export function getArchives () {
  return archives.all()
}

export function discoToKey (dkey) {
  // todo: optimize by caching the index globally.
  let structures = archives.all().reduce((acc, archive) => {
    archive.structures.forEach(s => {
      acc[s.key] = { ...s, archive: archive.key }
    })
    return acc
  }, {})

  let match = Object.values(structures).filter(a => a.discoveryKey === dkey)
  if (match && match.length) return match[0].archive
  return null
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
