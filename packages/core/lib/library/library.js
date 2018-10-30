const inherits = require('inherits')
const EventEmitter = require('events').EventEmitter
const crypto = require('hypercore-crypto')
const Archive = require('./archive')
const debug = require('debug')('archipel-library')

const { chainStorage, folderName } = require('./util')

module.exports = Library

function Library (storage, opts) {
  if (!(this instanceof Library)) return new Library(storage, opts)
  opts = opts || {}

  this.storage = chainStorage(storage)
  this.instances = {}
  this.archives = {}
  this.archiveTypes = opts.archiveTypes
}
inherits(Library, EventEmitter)

Library.prototype.getArchiveConstructor = function (type) {
  if (!this.archiveTypes[type]) throw new Error(`Archive type ${type} not registered.`)
  return this.archiveTypes[type].constructor
}

Library.prototype.createArchive = async function (type, opts, status) {
  const defaultStatus = {
    primary: true,
    parent: null,
    authorized: true,
    loaded: true
  }
  status = Object.assign({}, defaultStatus, status)
  return this.addArchive(type, null, opts, status)
}

Library.prototype.addRemoteArchive = async function (type, key, opts, status) {
  const defaultStatus = {
    primary: true,
    parent: null,
    authorized: false,
    loaded: false
  }
  status = Object.assign({}, defaultStatus, status)
  return this.addArchive(type, key, opts, status)
}

Library.prototype.addMount = async function (parentKey, type, key, opts) {
  // const parent = this.getArchive(parentKey)
  const status = {
    primary: false,
    parent: parentKey,
    authorized: false, // todo!
    loaded: false // todo!
  }
  return this.addArchive(type, key, opts, status)
}

Library.prototype.addArchive = async function (type, key, opts, status) {
  const instance = this._makeInstance(type, key, opts)
  const archive = Archive(this, type, instance, status)
  await this.pushArchive(archive)
  this.emit('add:archive', archive)
  return archive
}

Library.prototype.pushArchive = async function (archive) {
  this.archives[archive.key] = archive

  archive.on('mount', (mountInfo) => {
    const { type, key, opts } = mountInfo
    if (this.archives[key]) return
    this.addMount(archive.key, type, key, opts)
  })
}

Library.prototype.getArchive = function (key) {
  return this.archives[key]
}

Library.prototype.getArchiveInstance = function (key) {
  const archive = this.getArchive(key)
  return archive.getInstance()
}

Library.prototype.getPrimaryArchives = function () {
  return Object.values(this.archives).filter(a => a.getState().primary)
}

Library.prototype._makeInstance = function (type, key, opts) {
  opts = opts || {}
  const constructor = this.getArchiveConstructor(type)

  if (!key) {
    const keyPair = crypto.keyPair()
    key = keyPair.publicKey.toString('hex')
    opts.secretKey = keyPair.secretKey
  }

  const storage = this.storage(folderName(type, key))
  const instance = constructor(storage, key, opts)
  return instance
}
