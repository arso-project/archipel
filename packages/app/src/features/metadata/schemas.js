import SimplSchema from 'simpl-schema'

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
  console.log('getSchema for', category)
  console.log('SimplSchema', SimplSchema)
  console.log('resourceSchema', resourceSchema)
  switch (category) {
    case 'adress':
      return shallowObjectClone(adressSchema.schema())
    case 'article':
      return shallowObjectClone(articleSchema.schema())
    case 'file':
      return shallowObjectClone(fileSchema.schema())
    case 'image':
      return shallowObjectClone(imageSchema.schema())
    case 'person':
      return shallowObjectClone(personSchema.schema())
    case 'text':
      return shallowObjectClone(textSchema.schema())
    default:
      return shallowObjectClone(resourceSchema.schema())
  }
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