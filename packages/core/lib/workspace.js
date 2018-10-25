const crypto = require('hypercore-crypto')
const hyperdb = require('hyperdb')
const debug = require('debug')('workspace')
const { hex, chainStorage, keyToFolder, asyncThunk } = require('./util')

module.exports = Workspace

function Workspace (storage, key, opts) {
  if (!(this instanceof Workspace)) return new Workspace(storage, key, opts)

  this._storage = chainStorage(storage)
  this.key = key
  this.archives = {}
  this.info = {}

  this.db = hyperdb(this._storage('workspace'), key, {
    reduce: (a, b) => a,
    valueEncoding: 'json'
  })

  this.archiveTypes = opts.archiveTypes || {}

  this.ready = asyncThunk(this._ready.bind(this))
}

Workspace.prototype.registerArchiveTypes = function (archiveTypes) {
  this.archiveTypes = { ...this.archiveTypes, ...archiveTypes }
}

Workspace.prototype.getConstructor = function (type) {
  if (!this.archiveTypes[type]) throw new Error('Archive type ' + type + ' not registered.')
  return this.archiveTypes[type].constructor
}

Workspace.prototype._ready = function (done) {
  const self = this

  this.db.get('info', (err, node) => {
    if (err) done(err)
    else if (node) this.info = node.value
    openArchives(done)
  })

  function openArchives (done) {
    const rs = self.db.createReadStream('archive')

    let promises = []
    rs.on('data', (node) => {
      promises.push(self.openArchive(node.value.key, node.value))
    })
    rs.on('end', () => {
      Promise.all(promises).then(done).catch(done)
    })
  }
}

Workspace.prototype.setInfo = function (info) {
  const self = this
  return new Promise((resolve, reject) => {
    let value = Object.assign({}, self.info, info)
    self.db.put('info', value, (err, res) => {
      if (err) return reject(res)
      self.info = value
      resolve(value)
    })
  })
}

// todo: Error handling.
Workspace.prototype.getArchive = async function (key, type) {
  await this.ready()
  if (!this.archives[key]) throw new Error('Archive ' + key + ' not found.')
  if (this.archives[key].status.type !== type) return Error('Archive type mismatch for ' + key + ': Expected ' + type + ', got ' + this.archives[key].status.type)
  return this.archives[key].archive
}

Workspace.prototype.openArchive = async function (key, status) {
  if (!status) status = await this.getStatus(key)
  if (!status) throw new Error('Archive ' + key + ' not found.')
  const type = status.type
  const constructor = this.getConstructor(type)
  const archive = constructor(this._storage(storageFolder(key, type), key, status.opts))
  await archive.ready()
  this.archives[key] = { key, status, archive }
}

Workspace.prototype.createArchive = async function (type, info) {
  const keyPair = crypto.keyPair()
  const key = hex(keyPair.publicKey)
  const opts = {
    secretKey: keyPair.secretKey
  }

  const archive = this.getConstructor(type)(this._storage(storageFolder(key, type)), key, opts)
  await archive.ready()

  let status = {
    key: key,
    type,
    // opts,
    primary: true,
    sync: false
  }

  await this.setStatus(key, status)

  if (info && archive.setInfo) await archive.setInfo(info)

  this.archives[key] = { key, status, archive }

  return archive
}

Workspace.prototype.addArchive = function (type, key, opts) {

}

Workspace.prototype.listArchives = async function (opts) {
  await this.ready()
  opts = opts || {}
  const defaultFilter = ({ status }) => status && status.primary === true
  let filter = opts.filter || defaultFilter
  return Object.values(this.archives).filter(filter)
}

Workspace.prototype.getStatus = function (key) {
  const self = this
  return new Promise((resolve, reject) => {
    let dbkey = keyToDbKey(key)
    self.db.get(dbkey, (err, node) => {
      if (err) reject(err)
      resolve(node || {})
    })
  })
}

Workspace.prototype.setStatus = function (key, status) {
  const self = this
  return new Promise((resolve, reject) => {
    let dbkey = keyToDbKey(key)
    self.db.get(dbkey, (err, node) => {
      if (err) return reject(err)
      let value = node ? node.value : {}
      value = Object.assign({}, value, status)
      self.db.put(dbkey, value, (err, res) => {
        if (err) return reject(err)
        if (!self.archives[key]) self.archives[key] = {}
        self.archives[key].status = value
        // self.emit('status', key, value)
        resolve(true)
      })
    })
  })
}

Workspace.prototype.shareArchive = function (key) {

}

Workspace.prototype.unshareArchive = function (key) {

}

function storageFolder (key, type) {
  return type + '/' + keyToFolder(key)
}

function keyToDbKey (key) {
  return 'archive/' + hex(key)
}
