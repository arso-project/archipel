const { hex } = require('./hyperstack')
const sodium = require('sodium-universal')

module.exports = {
  authMessage
}

const cypherMessageVersion = '0.1'
const cypherMessageIdentifier = 'arso authentification message' 
const cypherEncoding = 'base64'
const msgEncoding = 'ascii'
const linelength = 32

// let nonce = Buffer.alloc(sodium.crypto_box_NONCEBYTES)
// sodium.randombytes_buf(nonce)
// const pubkey = Buffer.alloc(sodium.crypto_box_PUBLICKEYBYTES)
// const secKey = Buffer.alloc(sodium.crypto_box_PUBLICKEYBYTES)
// sodium.crypto_box_keypair(pubkey, secKey)

async function authMessage (archive, structures, userMsg) {

  if (typeof archive === 'object' && structures) return encryptionPipeline(archive, structures, userMsg)
  if (typeof archive === 'string') return decryptionPipeline(archive) 
  // return null
}

async function encryptionPipeline (archive, structures, userMsg) {
  let bufKeys = extractKeys(archive)
  let secret = constructSecret(structures, userMsg)
  let cypher = await encrypt(archive, structures, secret)
  let cypherMessage = constructCypherMessage(bufKeys.discoveryKey, cypher)
  return cypherMessage
}

async function decryptionPipeline (cypherMessage) {
  let cypherMsgParts = destructCypherMessage(cypherMessage)
  // not working:
  // discoveryKey to archiveMapping required
  let message = await decrypt(cypherMsgParts.cypher)
  return message
}

function constructSecret (structures, userMsg) {
  let secretObject = {
    structures,
    userMessage: userMsg
  }
  return JSON.stringify(secretObject)
}

function constructCypherMessage (discoveryKey, cypher) {
  let header = ''
  let footer = ''
  let cypherMessage = ''

  discoveryKey = multilineString(hex(discoveryKey), linelength)
  cypher = multilineString(cypher, linelength)
  for (let i = 0; i < linelength; i++) { header += '#' }
  footer += '\n\n'
  footer += header
  header += '\n\n'
  header += cypherMessageIdentifier
  header += '\n\n'
  header += 'Version: '
  header += cypherMessageVersion
  header += '\n\n'
  header += discoveryKey
  header += '\n\n'
  cypherMessage = header + cypher + footer

  return cypherMessage
}

function destructCypherMessage (cypherMessage) {
  let parts = cypherMessage.split('\n\n')
  parts.splice(0, 1)[0]
  let identifier = parts.splice(0, 1)[0]
  if (identifier !== cypherMessageIdentifier) console.warn('unknown cypher message type')
  let version = parts.splice(0, 1)[0]
  version = /[0-9.]{3,}/.exec(version)[0]
  if (version !== cypherMessageVersion) console.warn('unknown cypher message version')
  let discoveryKey
  try {
    discoveryKey = parts.splice(0, 1)[0].split('\n').join('')
  } catch (err) {
    console.warn('discoveryKey extraction failed')
    return null
  }
  let cypher
  try {
    cypher = parts.splice(0, 1)[0].split('\n').join('')
  } catch (err) {
    console.warn('cyphertext extraction failed')
  }
  return { discoveryKey, cypher, version }
}

async function encrypt (archive, structures, userMsg) {
  let msg = Buffer.from(userMsg, msgEncoding)
  let cypher = Buffer.alloc(sodium.crypto_box_SEALBYTES + msg.length)
  let keys = extractKeys(archive)
  let pubkey = Buffer.alloc(sodium.crypto_box_PUBLICKEYBYTES)
  try {
    sodium.crypto_sign_ed25519_pk_to_curve25519(pubkey, keys.encryptionKey)
  } catch (err) { console.warn(err) }
  return new Promise((resolve, reject) => {
    try {
      sodium.crypto_box_seal(cypher, msg, pubkey)
    } catch (err) { console.warn(err) }
    resolve(cypher.toString(cypherEncoding))
  })
}

async function decrypt (archive, cypher) {
  cypher = Buffer.from(cypher, cypherEncoding)
  let msg = await Buffer.alloc(cypher.length - sodium.crypto_box_SEALBYTES)
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
    if (sodium.crypto_box_seal_open(msg, cypher, pubkey, secKey)) {
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
