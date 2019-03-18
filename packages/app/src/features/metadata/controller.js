import { getApi } from '../../lib/api'
// import { makeLink, parseLink } from '@archipel/common/util/triples'
import { _initialSetMetadata, _setMetadataToBeValue, getMetadata } from './store'
import Schemas, { getCategoryFromMimeType, validCategory } from './schemas'

// TODO: getMetadata should return fileType specific metadata.
// TODO: adjust such that the Controller can watch react hooks using store
const CATEGORY = 'ofCategory'

export function FileMetadataController (props) {
  console.log(`FMC inintiated the ${props.count} time`)
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
  // this.writeChanges = this.writeChanges.bind(this)
  this.init()
  // this.log = setInterval(() => console.log('CONT:', 'constant:', this.constants), 2000)
}

FileMetadataController.prototype.init = async function () {
  // let { fileID } = this.constants
  if (this._ready) return
  let tripleStore = await getApi().then((apis) => apis.hypergraph)
  if (!tripleStore) throw new Error('Can not connect to TripleStore')
  this.constants.tripleStore = tripleStore
  // this.toBeMetadata = useToBeMetadata(fileID)
  // this.actualMetadata = useActualMetadata(fileID)
  if (!this._ready) {
    await this.getCategory()
    await this.getSchema()
    await this.genPlaceholders()
    await this.getMetadata()
  }
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
    // if (i === 'toBeMetadata') {
    //   setToBeMetadata(fileID, props[i])
    //   continue
    // }
    this.state[i] = props[i]
  }
}

FileMetadataController.prototype.category = function () {
  return this.state.category
}

FileMetadataController.prototype.getCategory = async function () {
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
  await this.setCategory(category)
  return category
}

FileMetadataController.prototype.setCategory = async function (category) {
  // console.log('Category', category, validCategory(category))
  if (!validCategory(category)) return this._setDefaultCategory()
  let { tripleStore, archiveKey, fileID } = this.constants
  await tripleStore.put(archiveKey,
    { subject: fileID, predicate: CATEGORY, object: category })
  this.setState({ category })
}

FileMetadataController.prototype.getSchema = async function () {
  if (this.Schema) return this.Schema
  if (!this.state.category) await this.getCategory()
  this.Schema = Schemas(this.state.category)
  return this.Schema
}

FileMetadataController.prototype.genPlaceholders = function (metadata) {
  let labels = this.Schema.label()
  if (!metadata) metadata = {}
  // console.log('genPlaceholdres, metadta', metadata)
  // console.log('genPlaceholdres, labels', labels)
  for (let i of Object.keys(labels)) {
    if (!metadata[i]) {
      metadata[i] = {}
      metadata[i].label = labels[i]
      metadata[i].actualValue = null
      metadata[i].toBeValue = null
      metadata[i].type = this.Schema.getQuickTypeForKey(i)
    }
  }
  this.setState({ metadata })
}

FileMetadataController.prototype.getMetadata = async function (clearToBeValues) {
  let { tripleStore, archiveKey, fileID } = this.constants
  let fileTriples = await tripleStore.get(archiveKey, { subject: fileID })
  let metadata = triplesToMetadata(fileTriples, this.Schema, 'actualValue')
  if (clearToBeValues) {
    metadata = this.clearToBeValues(metadata) 
  }
  // this.setState({ metadata })
  // TODO: rewrite to not genPlaceholders on every call.
  this.genPlaceholders(metadata)
}

FileMetadataController.prototype.setToBeValue = async function (entryKey, toBeValue) {
  console.log('FileMetadataController.setToBeValue clicked with:', entryKey, toBeValue)
  let { fileID } = this.constants
  console.log(fileID)
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
  let { writeTriples, deleteTriples } = metadataToTriples(fileID, await getMetadata(fileID), 'toBeValue', this.Schema.schema())
  await tripleStore.put(archiveKey, writeTriples)
  await tripleStore.del(archiveKey, deleteTriples)
  // TODO: Clear toBeValues
  if (!onUnmount) this.getMetadata(true)
}

FileMetadataController.prototype.clearToBeValues = function (metadata) {
  for (let entryKey of Object.keys(metadata)) {
    metadata[entryKey].toBeValue = []
  }
  console.log('cleared:', metadata)
  return metadata
}

FileMetadataController.prototype.howSchema = function () {
  console.log('schema.allowsKey', this.Schema.allowsKey('location'))
  console.log('schema.get', this.Schema.get('location'))
  console.log('schema.getDefinition', this.Schema.getDefinition())
  console.log('schema.getObjectSchema', this.Schema.getObjectSchema())
  console.log('schema.label', this.Schema.label())
  console.log('schema.labels', this.Schema.labels('fileName'))
  console.log('schema.schema', this.Schema.schema())
}

function triplesToMetadata (triples, schema, valueTempState) {
  if (!valueTempState) throw new Error('Need information on the temporal state of the metadata value!')
  let metadata = {}
  let labels = schema.label()
  for (let triple of triples) {
    // console.log('triplesToMetadata', triple)
    if (!metadata[triple.predicate]) metadata[triple.predicate] = {}
    // ToDo Makes this values!!! apriori unclear how many.
    if (!metadata[triple.predicate][valueTempState]) metadata[triple.predicate][valueTempState] = []
    metadata[triple.predicate][valueTempState].push(triple.object)
    if (labels[triple.predicate]) {
      metadata[triple.predicate].label = labels[triple.predicate]
      continue
    }
    metadata[triple.predicate].label = triple.predicate
  }
  if (metadata[CATEGORY]) delete metadata[CATEGORY]
  return metadata
}

function metadataToTriples (fileID, metadata, valueTempState, schema) {
  console.log(schema)
  if (!valueTempState) valueTempState = 'toBeValue'
  console.log('metadataToTriples', metadata)
  let writeTriples = []
  let deleteTriples = []
  for (let entryKey of Object.keys(metadata)) {
    if (metadata[entryKey][valueTempState]) {
      for (let value of metadata[entryKey][valueTempState]) {
        writeTriples.push({ subject: fileID, predicate: entryKey, object: value })
      }

      if (schema[entryKey].singleType) {
        for (let value of metadata[entryKey].actualValue) {
          deleteTriples.push({ subject: fileID, predicate: entryKey, object: value })
        }
      }
    }
  }
  return { writeTriples, deleteTriples }
}
