const crypto = require('hypercore-crypto')
const datenc = require('dat-encoding')

const { chainStorage, hex, asyncThunky } = require('../util')

module.exports = {
  chainStorage,
  folderName,
  hex,
  asyncThunky
}

function folderName (type, key) {
  key = hex(key)
  const str = discoveryKey(key)
  return type + '/' + str
}

function discoveryKey (publicKey) {
  return crypto.discoveryKey(datenc.toBuf(publicKey)).toString('hex')
}
