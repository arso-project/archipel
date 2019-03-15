import SimplSchema from 'simpl-schema'

const Categories = [
  'resource', 'file', 'image'
]

export default function Schemas (category) {
  switch (category) {
    case 'image':
      return imageSchema
    case 'file':
      return fileSchema
    default:
      return resourceSchema
  }
}

const resourceSchema = new SimplSchema({
  hasLabel: String,
  hasDescription: String
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
  hasAdress: {
    type: adressSchema,
    label: 'Adress'
  }
})
personSchema.extend(resourceSchema)

const imageSchema = new SimplSchema({
  hasTitle: {
    type: String,
    label: 'Title' },
  hasLocalOrigin: {
    type: String,
    label: 'Location' },
  hasDateOfCreation: {
    type: Date,
    label: 'Date of Creation' },
  hasCreator: {
    type: String,
    label: 'Creator' }
})
imageSchema.extend(resourceSchema)

const fileSchema = new SimplSchema({
  hasFileName: {
    type: String,
    label: 'file name' },
  hasPath: {
    type: String,
    label: 'file path' },
  hasCreator: {
    type: personSchema
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
  return Categories.includes(category)
}
