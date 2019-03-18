import { useState, useEffect } from 'react'
import { Store } from '../../lib/store'

let metadataStore = new Store('actualMetadata')

export function _initialSetMetadata (fileID, metadata) {
  // console.log('setM', metadata)
  metadataStore.set(fileID, metadata)
}

export function _setMetadataActualValue (fileID, entryID, actualValue) {
  if (!Array.isArray(actualValue)) throw new Error('Metadata entries have to be arrays!')
  let metadata = metadataStore.get(fileID)
  if (!metadata[entryID]) metadata[entryID] = {}
  metadata[entryID].actualValue = actualValue
  metadataStore.set(fileID, metadata)
}

export function _setMetadataToBeValue (fileID, entryID, toBeValue) {
  if (!Array.isArray(toBeValue)) throw new Error('Metadata entries have to be arrays!')
  let metadata = metadataStore.get(fileID)
  if (!metadata[entryID]) metadata[entryID] = {}
  metadata[entryID].toBeValue = toBeValue
  console.log(fileID, metadata)
  metadataStore.set(fileID, metadata)
}

export function getMetadata (fileID) {
  return metadataStore.get(fileID)
}

export function watchMetadata (fileID, cb, init) {
  metadataStore.watch(fileID, cb, init)
}

export function useMetadata (fileID) {
  const [state, setState] = useState(() => metadataStore.get(fileID))
  // console.log('useActualMetadata')
  useEffect(() => {
    // console.log('useEffect')
    metadataStore.watch(fileID, watcher, true)
    return () => metadataStore.unwatch(fileID, watcher)

    function watcher (value) {
      // console.log('watcher')
      setState(value)
    }
  }, [state])
  return state || {}
}

// export function useToBeMetadata (fileID) {
//   const [state, setState] = useState(() => toBeMetadata.get(fileID))
//   useEffect(() => {
//     toBeMetadata.watch(fileID, watcher, true)
//     return () => toBeMetadata.unwatch(fileID, watcher)

//     function watcher (value) { setState(value) }
//   }, [state])
//   return state || {}
// }

// export function filefileID (archive, path) {
//   return `${archive}/${path}`
// }
