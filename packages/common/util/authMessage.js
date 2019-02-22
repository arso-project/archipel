const { hex } = require('./hyperstack')
const sodium = require('sodium-universal')

module.exports = {
  createAuthCypher,
  decipherAuthRequest
}

const cipherMessageVersion = '0.1'
const cipherMessageIdentifier = 'arso authentification message' 
const cipherEncoding = 'base64'
const msgEncoding = 'ascii'
const linelength = 32

// let nonce = Buffer.alloc(sodium.crypto_box_NONCEBYTES)
// sodium.randombytes_buf(nonce)
// const pubkey = Buffer.alloc(sodium.crypto_box_PUBLICKEYBYTES)
// const secKey = Buffer.alloc(sodium.crypto_box_PUBLICKEYBYTES)
// sodium.crypto_box_keypair(pubkey, secKey)

async function createAuthCypher (archive, structures, userMsg) {
  let bufKeys = extractKeys(archive)
  let secret = constructSecret(structures, userMsg)
  let cipher = await encrypt(archive, secret)
  let cipherMessage = constructCipherMessage(bufKeys.discoveryKey, cipher)
  return cipherMessage
  // if (typeof archive === 'object' && structures) return encryptionPipeline(archive, structures, userMsg)
  // if (typeof archive === 'string') return decryptionPipeline(archive) 
  // return null
}

async function decipherAuthRequest (archives, cyphertext) {
  let { discoveryKey, cipher } = destructCipherMessage(cyphertext)
  let archivesKeys = {}
  archives.forEach(function (a) { archivesKeys[hex(a.primary.structure().discoveryKey)] = a.primary.structure().key })
  let decryptionKey = archivesKeys[discoveryKey]
  let archive = archives.find((a) => (a.key === hex(decryptionKey)))
  let authRequestStr = await decrypt(archive, cipher)
  console.log(authRequestStr)
  let authRequestObj
  try {
    authRequestObj = JSON.parse(authRequestStr)
    console.log(authRequestObj)
  } catch (err) {
    console.warn(err)
    if (err) {
      authRequestObj = { failure: 'Message to object reconstruction failed' }
    }
  }
  // let requestedPrimary = archives.find((a) => (a.key === authRequestObj.structures[0]))
  // requestedPrimary = requestedPrimary.serialize()
  // let requestedStructures = requestedPrimary.structures.filter()
  return authRequestObj
}

// async function decryptionPipeline (cipherMessage) {
//   let cipherMsgParts = destructCipherMessage(cipherMessage)
//   // not working:
//   // discoveryKey to archiveMapping required
//   let message = await decrypt(cipherMsgParts.cipher)
//   return message
// }

function constructSecret (structures, userMessage) {
  let secretObject = {
    structures,
    userMessage
  }
  return JSON.stringify(secretObject)
}

function constructCipherMessage (discoveryKey, cipher) {
  let header = ''
  let footer = ''
  let cipherMessage = ''

  discoveryKey = multilineString(hex(discoveryKey), linelength)
  cipher = multilineString(cipher, linelength)
  for (let i = 0; i < linelength; i++) { header += '#' }
  footer += '\n\n'
  footer += header
  header += '\n\n'
  header += cipherMessageIdentifier
  header += '\n\n'
  header += 'Version: '
  header += cipherMessageVersion
  header += '\n\n'
  header += discoveryKey
  header += '\n\n'
  cipherMessage = header + cipher + footer

  return cipherMessage
}

function destructCipherMessage (cipherMessage) {
  let parts = cipherMessage.split('\n\n')
  parts.splice(0, 1)[0]
  let identifier = parts.splice(0, 1)[0]
  if (identifier !== cipherMessageIdentifier) console.warn('unknown cipher message type')
  let version = parts.splice(0, 1)[0]
  version = /[0-9.]{3,}/.exec(version)[0]
  if (version !== cipherMessageVersion) console.warn('unknown cipher message version')
  let discoveryKey
  try {
    discoveryKey = parts.splice(0, 1)[0].split('\n').join('')
  } catch (err) {
    console.warn('discoveryKey extraction failed')
    return null
  }
  let cipher
  try {
    cipher = parts.splice(0, 1)[0].split('\n').join('')
  } catch (err) {
    console.warn('ciphertext extraction failed')
  }
  return { discoveryKey, cipher, version }
}

async function encrypt (archive, msg) {
  msg = Buffer.from(msg, msgEncoding)
  let cipher = Buffer.alloc(sodium.crypto_box_SEALBYTES + msg.length)
  let keys = extractKeys(archive)
  let pubkey = Buffer.alloc(sodium.crypto_box_PUBLICKEYBYTES)
  try {
    sodium.crypto_sign_ed25519_pk_to_curve25519(pubkey, keys.encryptionKey)
  } catch (err) { console.warn(err) }
  return new Promise((resolve, reject) => {
    try {
      sodium.crypto_box_seal(cipher, msg, pubkey)
    } catch (err) { console.warn(err) }
    resolve(cipher.toString(cipherEncoding))
  })
}

async function decrypt (archive, cipher) {
  cipher = Buffer.from(cipher, cipherEncoding)
  let msg = await Buffer.alloc(cipher.length - sodium.crypto_box_SEALBYTES)
  let keys = extractKeys(archive)
  let pubkey = Buffer.alloc(sodium.crypto_box_PUBLICKEYBYTES)

  try {
    sodium.crypto_sign_ed25519_pk_to_curve25519(pubkey, keys.encryptionKey)
  } catch (err) { console.warn(err) }

  let secretKey = archive.primary.structure().local._storage.secretKey
  let secSignKey = Buffer.alloc(sodium.crypto_sign_SECRETKEYBYTES)
  sodium.sodium_mlock(secSignKey)

  secSignKey = await new Promise((resolve, reject) => {
    secretKey.read(0, sodium.crypto_sign_SECRETKEYBYTES, async (err, sec) => {
      if (err) reject(console.warn(err))
      if (sec) {
        resolve(sec)
      }
    })
  })

  let secKey = Buffer.alloc(sodium.crypto_box_SECRETKEYBYTES)
  sodium.sodium_mlock(secKey)

  try {
    sodium.crypto_sign_ed25519_sk_to_curve25519(secKey, secSignKey)
  } catch (err) { console.warn(err) }

  return new Promise((resolve, reject) => {
    if (sodium.crypto_box_seal_open(msg, cipher, pubkey, secKey)) {
      sodium.sodium_munlock(secKey)
      sodium.sodium_munlock(secSignKey)

      resolve(msg.toString(msgEncoding))
    } else {
      reject(console.warn('Decryption failed: Either you are not the legitimate recipient or it got corrupted'))
    }
  })
}

function multilineString (string, linelength) {
  let ret = ''
  let tmp = {}
  while (string.length >= linelength) {
    tmp = splice(string, 0, linelength - 1)
    string = tmp.string
    ret += tmp.splice
    ret += '\n'
  }
  ret += string
  return ret
}

const splice = (str, start, end, add) => {
  if (start < 0) {
    start = str.length + start
    if (start < 0) start = 0
  }
  if (end < 0) {
    end = str.length + end
    if (end < 0) end = 0
  }
  let ret = str.slice(start, end)
  str = str.slice(0, start) + (add || '') + str.slice(end, str.length)
  return { string: str, splice: ret }
}

function extractKeys (archive) {
  let discoveryKey = archive.primary.structure().discoveryKey
  let encryptionKey = archive.primary.structure().key
  return { discoveryKey, encryptionKey }
}
