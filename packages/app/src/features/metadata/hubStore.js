import { useState, useEffect } from 'react'
import { Store } from '../../lib/store'

let metadataStore = new Store('actualMetadata')

/* Metadata Objects */

export function _initialSetMetadata (ID, metadata) {
  metadataStore.set(ID, metadata)
  metadataStore.trigger(ID)
}

export function _setMetadataValue (ID, entryID, value) {
  console.log('setMetadataValue', entryID, value)
  let metadata = metadataStore.get(ID)
  metadata[entryID].values[value.value] = value
  metadataStore.set(metadata)
}

export function getMetadata (ID) {
  let metadata = metadataStore.get(ID)
  if (Object.keys(metadata).length > 0) return metadata
  return null
}

export function watchMetadata (ID, cb, init) {
  metadataStore.watch(ID, cb, init)
}

export function useMetadata (ID) {
  const [state, setState] = useState(() => metadataStore.get(ID))
  useEffect(() => {
    metadataStore.watch(ID, watcher, true)

    function watcher (metadata) {
      setState(metadata)
    }
    return () => metadataStore.unwatch(ID, watcher)
  }, [state])
  return state || {}
}
