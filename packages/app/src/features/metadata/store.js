import { useState, useEffect } from 'react'
import { Store } from '../../lib/store'

let metadataStore = new Store('actualMetadata')

export function _initialSetMetadata (fileID, metadata) {
  metadataStore.set(fileID, metadata)
  metadataStore.trigger(fileID)
}

// export function _setMetadataActualValue (fileID, entryID, actualValue) {
//   if (!Array.isArray(actualValue)) throw new Error('Metadata entries have to be arrays!')
//   let metadata = metadataStore.get(fileID)
//   if (!metadata[entryID]) metadata[entryID] = {}
//   metadata[entryID].actualValue = actualValue
//   metadataStore.set(fileID, metadata)
// }

// export function _setMetadataToBeValue (fileID, entryID, toBeValue) {
//   if (!Array.isArray(toBeValue)) throw new Error('Metadata entries have to be arrays!')
//   let metadata = metadataStore.get(fileID)
//   if (!metadata[entryID]) metadata[entryID] = {}
//   // console.log('in store set:', toBeValue)
//   metadata[entryID].toBeValue = toBeValue
//   // console.log('in store set', metadata)
//   metadataStore.set(fileID, metadata)
// }
export function _setMetadataValue (fileID, entryID, value) {
  console.log('setMetadataValue', entryID, value)
  let metadata = metadataStore.get(fileID)
  metadata[entryID].values[value.value] = value
  metadataStore.set(metadata)
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
  console.log('useMetadata', state)
  useEffect(() => {
    metadataStore.watch(fileID, watcher, true)

    function watcher (metadata) {
      console.log('watcher', metadata)
      setState(metadata)
    }
    return () => metadataStore.unwatch(fileID, watcher)
  }, [state])
  return state || {}
}

// export function filefileID (archive, path) {
//   return `${archive}/${path}`
// }
