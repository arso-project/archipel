const bs58 = require('bs58')

module.exports = {
  encodeKey,
  decodeKey,
  makeLink,
  parseLink,
  structureId
}

function encodeKey (key) {
  if (!Buffer.isBuffer(key)) key = Buffer.from(key, 'hex')
  return bs58.encode(key)
}

function decodeKey (key) {
  const bytes = bs58.decode(key)
  return bytes.toString('hex')
}

function makeLink (discoveryKey, path) {
  let key = encodeKey(discoveryKey)
  if (path.charAt(0) !== '/') path = '/' + path
  return 'arso://' + key + path
}

function parseLink (link) {
  link = link.substring(7)
  let [key, ...path] = link.split('/')
  key = decodeKey(key)
  return { key, path: path.join('/') }
}

function structureId (structure) {
  if (structure.id) return structure.id
  else if (!structure.discoveryKey) return null
  return encodeKey(structure.discoveryKey)
}
