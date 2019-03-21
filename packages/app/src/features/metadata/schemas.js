import SimplSchema from 'simpl-schema'

const CategoryIDs = [
  'resource', 'file', 'image', 'person', 'address'
]
const CategoryLabels = [
  'Resource', 'File', 'Image', 'Person', 'Address'
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
  console.log('SimplSchema', SimplSchema)
  console.log('resourceSchema', resourceSchema)
  switch (category) {
    case 'image':
      return shallowObjectClone(imageSchema.schema())
    case 'file':
      return shallowObjectClone(fileSchema.schema())
    default:
      return shallowObjectClone(resourceSchema.schema())
  }
}

// function singleType () {
//   this.key = 'singleType'
//   // I'm just a placeholder to allow adding this as a custom property
// }

// SimplSchema.addValidator(singleType)
SimplSchema.extendOptions({
  singleType: Boolean
})

const resourceSchema = new SimplSchema({
  // hasLabel: String,
  hasDescription: {
    type: String,
    label: 'Description'
  },
  tag: {
    type: String,
    label: 'Tags'
  }
})

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
})

const personSchema = new SimplSchema({
  hasFirstName: {
    type: String,
    label: 'First name'
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

export function getCategoryFromMimeType (mime) {
  switch (mime) {
    case 'image/jpeg':
      return 'image'
    default:
      return 'file'
  }
}

export function validCategory (category) {
  return CategoryIDs.includes(category)
}

export function shallowObjectClone (object) {
  return Object.assign({}, object)
}