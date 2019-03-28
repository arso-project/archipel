import { getApi } from '../../lib/api'
// import { makeLink, parseLink } from '@archipel/common/util/triples'
import { _initialSetMetadata, _setMetadataValue, getMetadata } from './store'
import getSchema, { getCategoryFromMimeType, validCategory } from './schemas'

// TODO: rename toBe to draft
const CATEGORY = 'ofCategory'

export function FileMetadataController (props) {
  console.log('New FMC', props)
  this._ready = false
  this.controllerName = props.name
  this.constants = {
    archiveKey: props.key,
    fileID: props.fileID,
    mimetype: props.mimetype
  }
  this._schema = null
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
      console.log('write metadata', props, props[i])
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
  if (this._schema) return cloneObject(this._schema)
  if (!this.state.category) await this.getCategory()
  this._schema = await getSchema(this.state.category)
  console.log('getSchema', this._schema, { ...this._schema })
  return cloneObject(this._schema)
}

FileMetadataController.prototype._newSchema = async function () {
  if (!this.state.category) await this.getCategory()
  this._schema = getSchema(this.state.category)
  console.log('new Schema', this._schema)
  let metadata = await this.getSchema()
  console.log('newSchema', metadata)
  let oldMetadata = getMetadata(this.constants.fileID)
  // for (let entryKey of Object.keys(oldMetadata)) {
  //   console.log('new Schema', oldMetadata[entryKey])
  //   let actualValue = oldMetadata[entryKey].actualValue
  //   if (actualValue.lenght === 0 || actualValue[0] === '') continue
  //   console.log('transfering')
  //   if (!metadata[entryKey]) metadata[entryKey] = {}
  //   metadata[entryKey].actualValue = actualValue
  // }
  for (let entryKey of Object.keys(oldMetadata)) {
    if (!metadata[entryKey]) metadata[entryKey] = {}
    metadata[entryKey].values = { ...oldMetadata[entryKey].values }
  }
  this.setState({ metadata })
}

FileMetadataController.prototype._getActualMetadata = async function (clearToBeValues) {
  let { tripleStore, archiveKey, fileID } = this.constants
  // let metadata = await getMetadata(fileID)
  // metadata = { ...metadata }
  let fileTriples = await tripleStore.get(archiveKey, { subject: fileID })
  let schema = await this.getSchema()
  let metadata = triplesToMetadata(fileTriples, schema, 'actualValue')
  console.log('getActual', schema, metadata)
  // if (clearToBeValues) {
  //   metadata = this.clearToBeValues(metadata)
  // }
  this.setState({ metadata })
}

FileMetadataController.prototype.setDraftValue = async function (entryKey, draftValue) {
  if (!entryKey || !draftValue) return null
  if (draftValue.value) draftValue = draftValue.value
  let { fileID } = this.constants
  let metadata = { ...getMetadata(fileID) }
  let metadataEntry = metadata[entryKey]
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

FileMetadataController.prototype.setDeleteValue = async function (entryKey, value) {
  if (value.value) value = value.value
  let { fileID } = this.constants
  let metadata = { ...getMetadata(fileID) }
  let metadataEntry = metadata[entryKey]
  if (metadataEntry.values[value]) metadataEntry.values[value].state = 'delete'
  console.log('setDeleteValue', metadata, entryKey, value)
  this.setState({ metadata })
}

FileMetadataController.prototype.writeChanges = async function (props) {
  // TODO: Verify Metadata
  if (!props) props = {}
  let { onUnmount } = props
  let { archiveKey, fileID, tripleStore } = this.constants
  let { writeTriples, deleteTriples } = metadataToTriples(fileID, await getMetadata(fileID), 'toBeValue', await this.getSchema())
  let res1 = await tripleStore.put(archiveKey, writeTriples)
  let res2 = await tripleStore.del(archiveKey, deleteTriples)
  console.log('writeChanges', writeTriples, res1, 'delete:', deleteTriples, res2)
  // TODO: Clear toBeValues
  if (!onUnmount) this._getActualMetadata(true)
}

FileMetadataController.prototype.clearToBeValues = function (metadata) {
  for (let entryKey of Object.keys(metadata)) {
    metadata[entryKey].toBeValue = []
  }
}

function triplesToMetadata (triples, metadata, valueTempState) {
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

  if (metadata[CATEGORY]) delete metadata[CATEGORY]
  return metadata
}

function metadataToTriples (subject, metadata, valueTempState, schema) {
  let writeTriples = []
  let deleteTriples = []
  for (let predicate of Object.keys(metadata)) {
    let values = metadata[predicate].values
    if (!values) continue
    for (let value of Object.keys(values)) {
      console.log('second loop', value)
      if (values[value].state === 'actual') continue
      if (values[value].state === 'draft') {
        console.log('append draft to write')
        writeTriples.push({ subject, predicate, object: values[value].value })
        continue
      }
      if (values[value].state === 'delete') deleteTriples.push({ subject, predicate, object: values[value].value })
    }
  }
  console.log('to Triples, metadata fresh from store', metadata, writeTriples, deleteTriples)
  return { writeTriples, deleteTriples }
}
// function triplesToMetadata (triples, metadata, valueTempState) {
//   if (!valueTempState) throw new Error('Need information on the temporal state of the metadata value!')
//   let metadataValues = {}
//   for (let triple of triples) {
//     if (!metadataValues[triple.predicate]) metadataValues[triple.predicate] = {}
//     // ToDo Makes this values!!! apriori unclear how many.
//     if (!metadataValues[triple.predicate][valueTempState]) metadataValues[triple.predicate][valueTempState] = []
//     metadataValues[triple.predicate][valueTempState].push(triple.object)
//     metadataValues[triple.predicate].label = metadataValues[triple.predicate].label || triple.predicate
//   }
//   for (let entryKey of Object.keys(metadataValues)) {
//     if (!metadata[entryKey]) metadata[entryKey] = {}
//     metadata[entryKey][valueTempState] = metadataValues[entryKey][valueTempState]
//   }
//   if (metadata[CATEGORY]) delete metadata[CATEGORY]
//   return metadata
// }

// function metadataToTriples (subject, metadata, valueTempState, schema) {
//   console.log('to Triples, metadata fresh from store', metadata)
//   if (!valueTempState) valueTempState = 'toBeValue'
//   let writeTriples = []
//   let deleteTriples = []
//   for (let entryKey of Object.keys(metadata)) {
//     if (metadata[entryKey][valueTempState]) {
//       for (let value of metadata[entryKey][valueTempState]) {
//         writeTriples.push({ subject: subject, predicate: entryKey, object: value })
//       }

//       if (schema[entryKey].singleType && metadata[entryKey].actualValue) {
//         for (let value of metadata[entryKey].actualValue) {
//           deleteTriples.push({ subject: subject, predicate: entryKey, object: value })
//         }
//       }
//     }
//   }
//   return { writeTriples, deleteTriples }
// }

function cloneObject (obj) {
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
