const { hex } = require('./hyperstack')

module.exports = {
  authMessage
}

function authMessage (archive, structures, userMsg) {
  if (typeof archive === 'object' && structures) return authMessage.encrypt(archive, structures, userMsg)
  if (typeof archive === 'string') return authMessage.decrypt(archive)
  return null
}

authMessage.encrypt = function (archive, structures, userMsg) {
  let keys = authMessage.extractKeys(archive)
  if (!userMsg) {
    userMsg = 'please authorize:'
  }
  let retStruct = ''
  structures.reduce(a => '' + a)
  return `${keys.discoveryKey}
    ${keys.archiveKey}
    ${retStruct}
    ${userMsg}`
}

authMessage.decrypt = function (str) {
  return str
}

authMessage.extractKeys = function (archive) {
  let discoveryKey = hex(archive.primary.structure().discoveryKey)
  let encryptionKey = hex(archive.primary.structure().key)
  return { discoveryKey, encryptionKey }
}

//   async constructAuthReqMsg (archiveKey, structureKey) {
//     console.log('constructAuth:', archiveKey, structureKey, authMessage.listArchives())
//     let archive = authMessage.getArchive(archiveKey)
//     let structure = archive.getStructure(structureKey)
//     let discoveryKey = structure.discoveryKey
//     let encryptionKey = structure.key
//     console.log(discoveryKey, encryptionKey)
//   }
