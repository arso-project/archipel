const crypto = require('hypercore-crypto')
const datenc = require('dat-encoding')
const p = require('path')

module.exports = {
  chainStorage,
  folderName,
  hex
}

function chainStorage (parent) {
  return function (prefix) {
    if (typeof parent === 'function' || typeof parent === 'object') {
      return function (name) {
        return parent(p.join(prefix, name))
      }
    } else {
      return p.join(parent, prefix)
    }
  }
}

function folderName (type, key) {
  key = hex(key)
  const str = discoveryKey(key)
  return type + '/' + str
}

function discoveryKey (publicKey) {
  return crypto.discoveryKey(datenc.toBuf(publicKey)).toString('hex')
}

function hex (buf) {
  if (!Buffer.isBuffer(buf)) return buf
  return buf.toString('hex')
}
