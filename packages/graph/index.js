import { superstruct } from 'superstruct'

export function isRdfLiteral (value) {
  return (typeof value === 'string' && value.charAt(0) === '"')
}

const struct = superstruct({
  types: {
    rdfLiteral: isRdfLiteral
  }
})

const Triple = struct({
  subject: 'rdfval',
  predicate: 'rdf'
})
