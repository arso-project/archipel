import SimplSchema from 'simpl-schema'
import { cloneObject } from './util'

const CArray = Array
CArray.prototype.inArray = function (item) {
  return this.some(elem => elem === item)
}
CArray.prototype.pushUnique = function (item) {
  if (!this.inArray(item)) {
    this.push(item)
    return true
  }
  return false
}

const CategoryIDs = [
  'resource', 'file', 'image', 'person', 'address', 'text', 'article'
]
const CategoryLabels = [
  'Resource', 'File', 'Image', 'Person', 'Address', 'Text', 'Article'
]
export const Categories = [CategoryIDs, CategoryLabels]

Categories.getID = function (label) {
  if (label < 0) return this[0]
  return this[0][this[1].findIndex(i => i === label)]
}

Categories.getLabel = function (id) {
  if (id < 0) return this[1]
  return this[1][this[0].findIndex(i => i === id)]
}

export default function getSchema (category) {
  return cloneObject(_getSchema(category).schema())
}

function _getSchema (category) {
  switch (category) {
    case 'adress':
      return adressSchema
    case 'article':
      return articleSchema
    case 'file':
      return fileSchema
    case 'image':
      return imageSchema
    case 'person':
      return personSchema
    case 'text':
      return textSchema
    default:
      return resourceSchema
  }
}

const allKeysAndLabels = { keys: [], labels: [] }
allKeysAndLabels.init = false
allKeysAndLabels.labelFromKey = function (key) {
  return this.labels[this.keys.findIndex(elem => elem === key)]
}
allKeysAndLabels.keyFromLabel = function (label) {
  return this.keys[this.labels.findIndex(elem => elem === label)]
}
allKeysAndLabels.set = function (keysAndLabels) {
  let { keys, labels } = keysAndLabels
  if (keys.length !== labels.length) throw new Error('keys and labels should be in one-to-one order and hence of euqal length')
  this.keys = keys
  this.labels = labels
  allKeysAndLabels.init = true
}

export function getAllKeysAndLabels () {
  if (allKeysAndLabels.init) return allKeysAndLabels
  let keys = new CArray()
  let labels = new CArray()
  for (let id of Categories.getID(-1)) {
    let schema = _getSchema(id)
    schema._schemaKeys.forEach(key => {
      let res = keys.pushUnique(key)
      if (res) labels.push(schema.schema()[key].label)
    })
  }
  allKeysAndLabels.set({ keys, labels })
  return allKeysAndLabels
}

export function getCategoryFromMimeType (mime) {
  switch (mime) {
    case 'text/plain':
      return 'text'
    case 'application/pdf':
      return 'text'
    case 'image/jpeg':
      return 'image'
    default:
      return 'file'
  }
}

// SimplSchema.addValidator(singleType)
SimplSchema.extendOptions({
  singleType: Boolean
})

const resourceSchema = new SimplSchema({
  // hasLabel: String, // automatically by SimplSchema
  hasDescription: {
    type: String,
    label: 'Description'
  },
  hasTag: {
    type: String,
    label: 'Tag'
  }
})
resourceSchema.name = 'resource'

const adressSchema = new SimplSchema({
  hasCountry: {
    type: String,
    label: 'Country'
  },
  hasCity: {
    type: String,
    label: 'City'
  },
  hasPostalCode: {
    type: String,
    label: 'Postal code'
  },
  hasStreetNumber: {
    type: String,
    label: 'Street and number'
  }
}).extend(resourceSchema)
adressSchema.name = 'adress'

const personSchema = new SimplSchema({
  hasFirstName: {
    type: String,
    label: 'First name',
    singleType: true
  },
  hasMiddleNames: {
    type: String,
    label: 'Middle names'
  },
  hasLastName: {
    type: String,
    label: 'Last Name',
    singleType: true
  },
  hasAdress: {
    type: adressSchema,
    label: 'Adress'
  }
})
personSchema.extend(resourceSchema)
personSchema.name = 'person'

const textSchema = new SimplSchema({
  hasAbstract: {
    type: String,
    label: 'Abstract'
  },
  hasLanguage: {
    type: String,
    label: 'Language'
  }
}).extend(resourceSchema)
textSchema.name = 'text'

const articleSchema = new SimplSchema({
  hasAuthor: {
    type: personSchema,
    label: 'Author'
  },
  hasDateOfCreation: {
    type: Date,
    label: 'Release Date'
  },
  hasPlaceOfCreation: {
    type: adressSchema,
    label: 'Place of Publishing'
  }
}).extend(textSchema)
articleSchema.name = 'article'

const imageSchema = new SimplSchema({
  hasTitle: {
    type: String,
    label: 'Title',
    singleType: true },
  hasLocalOrigin: {
    type: String,
    label: 'Location' },
  hasDateOfCreation: {
    type: Date,
    label: 'Date of Creation',
    singleType: true },
  hasCreator: {
    type: personSchema,
    label: 'Creator' }
})
imageSchema.extend(resourceSchema)
imageSchema.name = 'image'

const fileSchema = new SimplSchema({
  hasFileName: {
    type: String,
    label: 'File name',
    singleType: true },
  hasPath: {
    type: String,
    label: 'File path',
    singleType: true },
  hasCreator: {
    type: personSchema,
    label: 'Creator',
    singleType: true
  }
})
fileSchema.extend(resourceSchema)
fileSchema.name = 'file'

export function validCategory (category) {
  return CategoryIDs.includes(category)
}

export function shallowObjectClone (object) {
  return Object.assign({}, object)
}