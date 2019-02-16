
export function isLiteral (value) {
  return (typeof value === 'string' && value.charAt(0) === '"')
}

export function isThing (value) {
  return !isLiteral(value)
}

const rdfValueMatch = /(".+")(?:\^\^(.+))?$/

export function fromRdfValue (value) {
  const match = value.match(rdfValueMatch)
  if (!match) return value
  // this could be smarter getting value type as well.
  // return { value: match[1], type: match[2] }
  if (match[2] === 'xsd:decimal') {
    return parseFloat(match[1].slice(1, -1))
  }
  return JSON.parse(match[1])
}

export function literal (value) {
  if (typeof value === 'number') {
    return `"${value}"^^xsd:decimal`
  } else {
    return JSON.stringify(value)
  }
}

export function toRdfValue (value) {
  if (isNode(value)) {
    return value.name
  } else if (typeof value === 'number') {
    return `"${value}"^^xsd:decimal`
  } else {
    return JSON.stringify(value)
  }
}

function mapPathPropOnTree (old, path, props) {
  const newTree = {}
  let oldPos = old
  let pos = newTree
  path.forEach((id, idx) => {
    oldPos = oldPos[id] || {}
    pos[id] = { ...oldPos }
    if (idx === path.length - 1) {
      pos[id] = { ...pos[id], ...props }
    }
    pos = pos[id]
  })
  return newTree
}

export function getPath (tree, path) {
  return path.reduce((cur, el) => {
    if (cur && typeof cur === 'object' && el in cur) return cur[el]
    return null
  }, tree)
}

export function getPathWithoutNs (tree, path) {
  return path.reduce((cur, el) => {
    if (cur && typeof cur === 'object' && el in cur) return cur[el]
    else if (cur && typeof cur === 'object') {
      for (let key in cur) {
        let parts = key.split(':')
        if (parts[1] && parts[1] === el) return cur[key]
      }
    }
    return null
  }, tree)
}
