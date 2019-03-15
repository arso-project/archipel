import { useState, useEffect } from 'react'
import { Store } from '../../lib/store'

let actualMetadata = new Store('actualMetadata')
let toBeMetadata = new Store('toBeMetadata')

export function _setActualMetadata (id, metadata) {
  // console.log('setM', metadata)
  actualMetadata.set(id, metadata)
}

export function setToBeMetadata (id, metadata) {
  // console.log('setM', metadata)
  toBeMetadata.set(id, metadata)
}

export function getActualMetadata (id) {
  return actualMetadata.get(id)
}

export function getToBeMetadata (id) {
  return toBeMetadata.get(id)
}

export function watchActualMetadata (id, cb, init) {
  actualMetadata.watch(id, cb, init)
}

export function watchToBeMetadata (id, cb, init) {
  toBeMetadata.watch(id, cb, init)
}

export function useActualMetadata (id) {
  const [state, setState] = useState(() => actualMetadata.get(id))
  // console.log('useActualMetadata')
  useEffect(() => {
    // console.log('useEffect')
    actualMetadata.watch(id, watcher, true)
    return () => actualMetadata.unwatch(id, watcher)

    function watcher (value) {
      // console.log('watcher')
      setState(value)
    }
  }, [state])
  return state || {}
}

export function useToBeMetadata (id) {
  const [state, setState] = useState(() => toBeMetadata.get(id))
  useEffect(() => {
    toBeMetadata.watch(id, watcher, true)
    return () => toBeMetadata.unwatch(id, watcher)

    function watcher (value) { setState(value) }
  }, [state])
  return state || {}
}

// export function fileid (archive, path) {
//   return `${archive}/${path}`
// }
