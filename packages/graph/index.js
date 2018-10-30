import { superstruct } from 'superstruct'

export function isRdfLiteral (value) {
  return (typeof value === 'string' && value.charAt(0) === '"')
}

export function isRdfValue (value) {
  return (typeof value === 'string' && value.charAt(0) === '"')
}

export function isRdfValueOrLiteral (value) {
  return isRdfValue(value) || isRdfLiteral(value)
}

const struct = superstruct({
  types: {
    rdfLiteral: isRdfLiteral,
    rdfValue: isRdfValue,
    rdfValueOrLiteral: isRdfValueOrLiteral
  }
})

const Triple = struct({
  subject: 'rdfValueOrLiteral',
  object: 'rdfValueOrLiteral',
  predicate: 'rdfValueOrLiteral'
})

const SomeEntityType = struct({
  id: 'id',
  someProp: 'rdfValueOrLiteral',
  someSpecificProp: 'someSpecificProp'
})