'use strict'

export const CATEGORY = 'ofCategory'

export function triplesToMetadata (triples, metadata) {
  if (!metadata) metadata = {}
  for (let triple of triples) {
    let { predicate, object } = triple
    if (!metadata[predicate]) {
      metadata[predicate] = {}
    }

    let dataEntry = metadata[predicate]
    if (!dataEntry.label) dataEntry.label = predicate
    if (!dataEntry.values) dataEntry.values = {}
    if (!dataEntry.values[object]) dataEntry.values[object] = {}
    dataEntry.values[object].state = 'actual'
    dataEntry.values[object].value = object
  }

  // if (metadata[CATEGORY]) delete metadata[CATEGORY]
  return metadata
}

export function metadataToTriples (subject, metadata) {
  let writeTriples = []
  let deleteTriples = []
  for (let predicate of Object.keys(metadata)) {
    let values = metadata[predicate].values
    if (!values) continue
    for (let value of Object.keys(values)) {
      if (values[value].state === 'actual') continue
      if (values[value].state === 'draft') {
        writeTriples.push({ subject, predicate, object: values[value].value })
        continue
      }
      if (values[value].state === 'delete') deleteTriples.push({ subject, predicate, object: values[value].value })
    }
  }
  return { writeTriples, deleteTriples }
}

export function cloneObject (obj) {
  var clone = {}
  for (var i in obj) {
    if (obj[i] !== null && typeof obj[i] === 'object') {
      clone[i] = cloneObject(obj[i])
    } else {
      clone[i] = obj[i]
    }
  }
  return clone
}