import { getApi } from '../../lib/api'
// import { makeLink, parseLink } from '@archipel/common/util/triples'
import { _initialSetMetadata, _setMetadataToBeValue, getMetadata } from './store'
import getSchema, { getCategoryFromMimeType, validCategory } from './schemas'

// TODO: getMetadata should return fileType specific metadata.
// TODO: adjust such that the Controller can watch react hooks using store
const CATEGORY = 'ofCategory'

export function FileMetadataController (props) {
  this._ready = false
  this.controllerName = props.name
  this.constants = {
    archiveKey: props.key,
    fileID: props.fileID,
    mimetype: props.mimetype
  }
  this.state = {
    category: null
  }
  this.init()
}

FileMetadataController.prototype.init = async function () {
  if (this._ready) return
  if (!this.constants.fileID) throw new Error('No fileID!')
  let tripleStore = await getApi().then((apis) => apis.hypergraph)
  if (!tripleStore) throw new Error('Can not connect to TripleStore')
  this.constants.tripleStore = tripleStore

  await this.getCategory()
  await this.getSchema()
  // await this.genPlaceholders()
  await this._getActualMetadata()
  this._ready = true
}

// Define setState function to allow for easy switch
// to using react setState or similar state controllers
FileMetadataController.prototype.setState = function (props) {
  const { fileID } = this.constants
  for (let i of Object.keys(props)) {
    if (i === 'metadata') {
      _initialSetMetadata(fileID, props[i])
      continue
    }
    this.state[i] = props[i]
  }
}

// Needs to be sync
FileMetadataController.prototype.category = function () {
  return this.state.category || null
}

FileMetadataController.prototype.getCategory = async function () {
  if (this.state.category) return this.state.category
  let { tripleStore, archiveKey, fileID } = this.constants

  let queryRes = await tripleStore.get(
    archiveKey, { subject: fileID, predicate: CATEGORY }
  )

  if (queryRes.length < 1) return this._setDefaultCategory()

  if (queryRes.length === 1 && validCategory(queryRes[0].object)) {
    this.setState({ category: queryRes[0].object })
    return queryRes[0].object
  }
  if (queryRes.length === 1 && !validCategory(queryRes[0].object)) {
    console.warn('Invalid metadata category, reset to mimetype default')
    return this._setDefaultCategory()
  }
  console.warn('Category ambiguous, reset mimetype default')
  await tripleStore.del(archiveKey, queryRes)
  return this._setDefaultCategory()
}

FileMetadataController.prototype._setDefaultCategory = async function () {
  let { mimetype } = this.constants
  if (!mimetype) {
    console.warn('No mimeType, setting metadata category to "resource"')
    mimetype = 'resource'
  }
  let category = getCategoryFromMimeType(mimetype)
  await this._setCategory(category)
  return category
}

FileMetadataController.prototype._setCategory = async function (category) {
  if (!validCategory(category)) return this._setDefaultCategory()
  let { tripleStore, archiveKey, fileID } = this.constants
  await tripleStore.put(archiveKey,
    { subject: fileID, predicate: CATEGORY, object: category })
  this.setState({ category })
}

FileMetadataController.prototype.setCategory = async function (category) {
  await this._setCategory(category)
  this._newSchema()
}

FileMetadataController.prototype.getSchema = async function () {
  if (this.schema) return this.schema
  if (!this.state.category) await this.getCategory()
  this.schema = getSchema(this.state.category)
  return this.schema
}

FileMetadataController.prototype._newSchema = async function () {
  if (!this.state.category) await this.getCategory()
  this.schema = getSchema(this.state.category)
  let metadata = this.schema
  let oldMetadata = getMetadata(this.constants.fileID)
  for (let entryKey of Object.keys(oldMetadata)) {
    if (!metadata[entryKey]) metadata[entryKey] = {}
    metadata[entryKey].actualValue = oldMetadata[entryKey].actualValue
  }
  this.setState({ metadata })
}

FileMetadataController.prototype._getActualMetadata = async function (clearToBeValues) {
  let { tripleStore, archiveKey, fileID } = this.constants
  let metadata = await getMetadata(fileID)
  let fileTriples = await tripleStore.get(archiveKey, { subject: fileID })
  metadata = triplesToMetadata(fileTriples, metadata || this.schema, 'actualValue')
  if (clearToBeValues) {
    metadata = this.clearToBeValues(metadata)
  }
  this.setState({ metadata })
}

FileMetadataController.prototype.setToBeValue = async function (entryKey, toBeValue) {
  if (!entryKey || !toBeValue) return
  let { fileID } = this.constants
  // TODO check Schema for entryKey and if not present use some so far not existing general preset
  if (!Array.isArray(toBeValue) &&
    (typeof toBeValue === 'string' || typeof toBeValue === 'number')) {
    toBeValue = [toBeValue]
  }
  _setMetadataToBeValue(fileID, entryKey, toBeValue)
}

FileMetadataController.prototype.writeChanges = async function (props) {
  // TODO: Verify Metadata
  if (!props) props = {}
  let { onUnmount } = props
  let { archiveKey, fileID, tripleStore } = this.constants
  let { writeTriples, deleteTriples } = metadataToTriples(fileID, await getMetadata(fileID), 'toBeValue', this.schema)
  await tripleStore.put(archiveKey, writeTriples)
  await tripleStore.del(archiveKey, deleteTriples)
  // TODO: Clear toBeValues
  if (!onUnmount) this._getActualMetadata(true)
}

FileMetadataController.prototype.clearToBeValues = function (metadata) {
  for (let entryKey of Object.keys(metadata)) {
    metadata[entryKey].toBeValue = []
  }
}

function triplesToMetadata (triples, metadata, valueTempState) {
  if (!valueTempState) throw new Error('Need information on the temporal state of the metadata value!')
  let metadataValues = {}
  for (let triple of triples) {
    if (!metadataValues[triple.predicate]) metadataValues[triple.predicate] = {}
    // ToDo Makes this values!!! apriori unclear how many.
    if (!metadataValues[triple.predicate][valueTempState]) metadataValues[triple.predicate][valueTempState] = []
    metadataValues[triple.predicate][valueTempState].push(triple.object)
    metadataValues[triple.predicate].label = metadataValues[triple.predicate].label || triple.predicate
  }
  for (let entryKey of Object.keys(metadataValues)) {
    if (!metadata[entryKey]) metadata[entryKey] = {}
    metadata[entryKey][valueTempState] = metadataValues[entryKey][valueTempState]
  }
  if (metadata[CATEGORY]) delete metadata[CATEGORY]
  return metadata
}

function metadataToTriples (subject, metadata, valueTempState, schema) {
  if (!valueTempState) valueTempState = 'toBeValue'
  let writeTriples = []
  let deleteTriples = []
  for (let entryKey of Object.keys(metadata)) {
    if (metadata[entryKey][valueTempState]) {
      for (let value of metadata[entryKey][valueTempState]) {
        writeTriples.push({ subject: subject, predicate: entryKey, object: value })
      }

      if (schema[entryKey].singleType && metadata[entryKey].actualValue) {
        for (let value of metadata[entryKey].actualValue) {
          deleteTriples.push({ subject: subject, predicate: entryKey, object: value })
        }
      }
    }
  }
  return { writeTriples, deleteTriples }
}
