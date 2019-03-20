import { useState, useEffect } from 'react'
import { StatefulStore, Store } from '../../lib/store'

let metadataStore = new Store('actualMetadata')

export function _initialSetMetadata (fileID, metadata) {
  metadataStore.set(fileID, metadata)
  metadataStore.trigger(fileID)
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
  metadataStore.set(fileID, metadata)
}

export function getMetadata (fileID) {
  let metadata = metadataStore.get(fileID)
  if (Object.keys(metadata).length > 0) return metadata
  return null
}

export function watchMetadata (fileID, cb, init) {
  metadataStore.watch(fileID, cb, init)
}

export function useMetadata (fileID) {
  // TODO:  on metadataStore.trigger()  the watcher will be called, but the function isn't executed.
  //        Hence, useMetadata isn't returning
  const [state, setState] = useState(() => metadataStore.get(fileID))
  useEffect(() => {
    metadataStore.watch(fileID, watcher, true)

    function watcher (metadata) {
      setState(metadata)
    }
    return () => metadataStore.unwatch(fileID, watcher)
  })
  return state || {}
}

// export function filefileID (archive, path) {
//   return `${archive}/${path}`
// }
