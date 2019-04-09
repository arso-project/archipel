'use strict'

import { getApi } from '../../lib/api'
import { _initialSetMetadata, getMetadata } from './editorStore'
import getSchema, { getCategoryFromMimeType, validCategory } from './schemas'
import { CATEGORY, triplesToMetadata, metadataToTriples, cloneObject } from './util'

export function EditorController (props) {
  console.log('New FMC', props)
  this._ready = false
  this.controllerName = props.name
  this.constants = {
    archiveKey: props.archive,
    ID: props.ID,
    type: props.mimetype || props.type
  }
  this._schema = null
  this.state = {
    category: null
  }
  this.init()
}

EditorController.prototype.init = async function () {
  if (this._ready) return
  if (!this.constants.ID) throw new Error('No ID!')
  let tripleStore = await getApi().then((apis) => apis.hypergraph)
  if (!tripleStore) throw new Error('Can not connect to TripleStore')
  this.constants.tripleStore = tripleStore

  await this.getCategory()
  await this.getSchema()
  await this._getActualMetadata()

  this._ready = true
}

// Define setState function to allow for easy switch
// to using react setState or similar state controllers
EditorController.prototype.setState = function (props) {
  const { ID } = this.constants
  for (let i of Object.keys(props)) {
    if (i === 'metadata') {
      _initialSetMetadata(ID, props[i])
      continue
    }
    this.state[i] = props[i]
  }
}

/* ### set and get Category ### */

// Needs to be sync
EditorController.prototype.category = function () {
  return this.state.category || null
}

EditorController.prototype.getCategory = async function () {
  if (this.state.category) return this.state.category
  let { tripleStore, archiveKey, ID } = this.constants

  let queryRes = await tripleStore.get(
    archiveKey, { subject: ID, predicate: CATEGORY }
  )

  if (queryRes.length < 1) return this._setDefaultCategory()

  if (queryRes.length === 1 && validCategory(queryRes[0].object)) {
    this.setState({ category: queryRes[0].object })
    return queryRes[0].object
  }
  if (queryRes.length === 1 && !validCategory(queryRes[0].object)) {
    console.warn('Invalid metadata category, reset to type default')
    return this._setDefaultCategory()
  }
  console.warn('Category ambiguous, reset type default')
  await tripleStore.del(archiveKey, queryRes)
  return this._setDefaultCategory()
}

EditorController.prototype.setCategory = async function (category) {
  await this._setCategory(category)
  this._newSchema()
}

EditorController.prototype._setCategory = async function (category) {
  if (!validCategory(category)) return this._setDefaultCategory()
  let { tripleStore, archiveKey, ID } = this.constants
  await tripleStore.put(archiveKey,
    { subject: ID, predicate: CATEGORY, object: category })
  this.setState({ category })
}

EditorController.prototype._setDefaultCategory = async function () {
  let { type } = this.constants
  if (!type) {
    console.warn('No mimeType, setting metadata category to "resource"')
    type = 'resource'
  }
  let category
  if (validCategory(type)) {
    category = type
  } else {
    category = getCategoryFromMimeType(type)
  }
  await this._setCategory(category)
  return category
}

/* Get Schema according to category */

EditorController.prototype.getSchema = async function () {
  if (this._schema) return cloneObject(this._schema)
  if (!this.state.category) await this.getCategory()
  this._schema = await getSchema(this.state.category)
  return cloneObject(this._schema)
}

EditorController.prototype._newSchema = async function () {
  if (!this.state.category) await this.getCategory()
  this._schema = getSchema(this.state.category)
  let metadata = await this.getSchema()
  let oldMetadata = getMetadata(this.constants.ID)

  for (let entryKey of Object.keys(oldMetadata)) {
    if (!metadata[entryKey]) metadata[entryKey] = {}
    metadata[entryKey].values = { ...oldMetadata[entryKey].values }
  }
  this.setState({ metadata })
}

/* Work on the metadata-Object */

EditorController.prototype._getActualMetadata = async function () {
  let { tripleStore, archiveKey, ID } = this.constants

  let fileTriples = await tripleStore.get(archiveKey, { subject: ID })
  let schema = await this.getSchema()
  let metadata = triplesToMetadata(fileTriples, schema, 'actualValue')

  this.setState({ metadata })
}

EditorController.prototype.setDraftValue = async function (entryKey, draftValue) {
  if (!entryKey || !draftValue) return null
  if (draftValue.value) draftValue = draftValue.value
  let { ID } = this.constants
  let metadata = { ...getMetadata(ID) }
  let metadataEntry = metadata[entryKey]
  if (!metadataEntry.values) metadataEntry.values = {}
  if (metadataEntry.values[draftValue]) {
    if (metadataEntry.values[draftValue].state === 'actual') return
    if (metadataEntry.values[draftValue].state === 'draft') return
    if (metadataEntry.values[draftValue].state === 'delete') {
      metadataEntry.values[draftValue].state = 'draft'
      this.setState({ metadata })
      return
    }
  }
  if (metadataEntry.singleType) {
    for (let valueKey of Object.keys(metadataEntry.values)) {
      metadataEntry.values[valueKey].state = 'delete'
    }
  }
  metadataEntry.values[draftValue] = { state: 'draft', value: draftValue }
  this.setState({ metadata })
}

EditorController.prototype.setDeleteValue = async function (entryKey, value) {
  if (value.value) value = value.value
  let { ID } = this.constants
  let metadata = { ...getMetadata(ID) }
  let metadataEntry = metadata[entryKey]
  if (metadataEntry.values[value]) metadataEntry.values[value].state = 'delete'
  this.setState({ metadata })
}

EditorController.prototype.writeChanges = async function (props) {
  // TODO: Verify Metadata
  if (!props) props = {}
  let { onUnmount } = props
  let { archiveKey, ID, tripleStore } = this.constants
  let { writeTriples, deleteTriples } = metadataToTriples(ID, await getMetadata(ID), 'toBeValue', await this.getSchema())
  await tripleStore.put(archiveKey, writeTriples)
  await tripleStore.del(archiveKey, deleteTriples)
  if (!onUnmount) this._getActualMetadata(true)
}