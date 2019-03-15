import { getApi } from '../../lib/api'
import { makeLink, parseLink } from '@archipel/common/util/triples'
import { _setActualMetadata, setToBeMetadata, getActualMetadata, getToBeMetadata, useToBeMetadata, useActualMetadata } from './store'
import Schemas, { getCategoryFromMimeType, validCategory } from './schemas'
import { useArchive } from '../archive/archive'
import { timingSafeEqual } from 'crypto';

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
    await this.getMetadata()
  }
  this._ready = true
}

// Define setState function to allow for easy switch
// to using react setState or similar state controllers
FileMetadataController.prototype.setState = function (props) {
  const { fileID } = this.constants
  for (let i of Object.keys(props)) {
    if (i === 'actualMetadata') {
      _setActualMetadata(fileID, props[i])
      continue
    }
    if (i === 'toBeMetadata') {
      setToBeMetadata(fileID, props[i])
      continue
    }
    this.state[i] = props[i]
  }
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
  // console.log('genPlaceholdres, metadta', metadata)
  // console.log('genPlaceholdres, labels', labels)
  for (let i of Object.keys(labels)) {
    if (!metadata[i]) {
      metadata[i] = {}
      metadata[i].label = labels[i]
      metadata[i].value = null
      metadata[i].type = this.Schema.getQuickTypeForKey(i)
    }
  }
  this.setState({ toBeMetadata: metadata })
}

FileMetadataController.prototype.getMetadata = async function () {
  let { tripleStore, archiveKey, fileID } = this.constants
  let fileTriples = await tripleStore.get(archiveKey, { subject: fileID })
  let metadata = triplesToMetadata(fileTriples, this.Schema)
  this.setState({ actualMetadata: metadata })
  this.genPlaceholders(metadata)
}

FileMetadataController.prototype.addtoToBeMetadata = async function (metadataEntries) {
  let { fileID } = this.constants
  let metadata = await getToBeMetadata(fileID)
  for (let entryKey of metadataEntries) {
    metadata[entryKey] = metadataEntries[entryKey]
  }
  this.setState({ toBeMetadata: metadata })
}

FileMetadataController.prototype.writeChanges = async function (props) {
  // TODO: Verify Metadata
  let { onUnmount } = props
  let { archiveKey, fileID } = this.constants
  let triples = metadataToTriples(fileID, await getToBeMetadata(fileID))
  await this.tripleStore.put(archiveKey, triples)
  if (!onUnmount) this.getMetadata()
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

function triplesToMetadata (triples, schema) {
  let metadata = {}
  let labels = schema.label()
  for (let triple of triples) {
    // console.log('triplesToMetadata', triple)
    metadata[triple.predicate] = {}
    // ToDo Makes this values!!! apriori unclear how many.
    metadata[triple.predicate].value = triple.object
    if (labels[triple.predicate]) {
      metadata[triple.predicate].label = labels[triple.predicate]
      continue
    }
    metadata[triple.predicate].label = triple.predicate
  }
  if (metadata[CATEGORY]) delete metadata[CATEGORY]
  return metadata
}

function metadataToTriples (fileID, metadata) {
  let triples = []
  for (let entryKey of metadata) {
    triples.push({ subject: fileID, predicate: entryKey, object: metadata[entryKey].value })
  }
  return triples
}
