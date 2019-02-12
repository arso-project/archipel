const crypto = require('hypercore-crypto')
const p = require('path')

module.exports = {
  hex,
  nestStorage,
  discoveryKey,
  keyPair
}

function nestStorage (storage, ...prefixes) {
  return function (name, opts) {
    let path = p.join(...prefixes, name)
    let ret = storage(path, opts)
    return ret
  }
}

function discoveryKey (publicKey) {
  return crypto.discoveryKey(datenc.toBuf(publicKey)).toString('hex')
}

function hex (buf) {
  if (!Buffer.isBuffer(buf)) return buf
  return buf.toString('hex')
}

function keyPair () {
  return crypto.keyPair()
}

