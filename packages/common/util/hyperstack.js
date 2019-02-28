const crypto = require('hypercore-crypto')
const p = require('path')

module.exports = {
  hex,
  hexToBuf,
  nestStorage,
  discoveryKey,
  keyPair,
  validateKey
}

function nestStorage (storage, ...prefixes) {
  return function (name, opts) {
    let path = p.join(...prefixes, name)
    let ret = storage(path, opts)
    return ret
  }
}

function discoveryKey (publicKey) {
  return hex(crypto.discoveryKey(hexToBuf(publicKey)))
}

function hex (buf) {
  if (!Buffer.isBuffer(buf)) return buf
  return buf.toString('hex')
}

function hexToBuf (hex) {
  if (Buffer.isBuffer(hex)) return hex
  return Buffer.from(hex, 'hex')
}

function keyPair () {
  return crypto.keyPair()
}

function validateKey (key) {
  key = hex(key)
  if (typeof key !== 'string') return false
  var match = /([a-f0-9]{64,65})/i.exec(key)
  // we need exactly 64, so an hexa string with 65 chars (or more) is not allowed
  if (!match || match[1].length !== 64) return false
  return true
}
