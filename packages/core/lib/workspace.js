const crypto = require('hypercore-crypto')
const hyperdb = require('hyperdb')
const debug = require('debug')('workspace')
const hyperdiscovery = require('hyperdiscovery')
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
      console.log('NODE', node)
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
    share: false
  }

  await this.setStatus(key, status)

  if (info && archive.setInfo) await archive.setInfo(info)

  this.archives[key] = { key, status, archive }

  return archive
}

Workspace.prototype.addRemoteArchive = async function (type, key, opts) {
  const archive = this.getConstructor(type)(this._storage(storageFolder(key, type)), key, opts)
  let status = {
    key: key,
    type,
    primary: true,
    share: false
  }

  await this.setStatus(key, status)

  this.archives[key] = { key, status, archive }

  await this.setShare(key, true)

  return archive
}

Workspace.prototype.listArchives = async function (opts) {
  await this.ready()
  opts = opts || {}
  const defaultFilter = ({ status }) => status && status.primary === true
  let filter = opts.filter || defaultFilter
  return Object.values(this.archives).filter(filter)
}

Workspace.prototype.getPrimaryArchives = function () {
  const filter = ({ status }) => status && status.primary === true
  return Object.values(this.archives).filter(filter).map(a => a.key)
}

Workspace.prototype.getPrimaryArchivesWithInfo = async function () {
  await this.ready()
  const self = this
  let keys = this.getPrimaryArchives()
  return Promise.all(keys.map(key => self.getStatusAndInfo(key)))
}

Workspace.prototype.getStatus = function (key) {
  const self = this
  return new Promise((resolve, reject) => {
    let dbkey = keyToDbKey(key)
    self.db.get(dbkey, (err, node) => {
      if (err) reject(err)
      resolve(node.value || {})
    })
  })
}

Workspace.prototype.getStatusAndInfo = async function (key) {
  if (!this.archives[key]) return null
  let status = await this.getStatus(key)
  let info = await this.archives[key].archive.getInfo()
  return { ...info, status, key }
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
        resolve(value)
      })
    })
  })
}

Workspace.prototype.setShare = async function (key, share) {
  if (share) return this._doShare(key)
  else return this._doUnshare(key)
}

Workspace.prototype._doShare = async function (key) {
  await this.setStatus(key, { share: true })
  let archive = this.archives[key].archive
  let network = hyperdiscovery(archive)
  this.archives[key].network = network
  network.on('connection', (peer) => console.log('got peer!'))
}

Workspace.prototype._doUnshare = async function (key) {
  await this.setStatus(key, { share: false })
}

function storageFolder (key, type) {
  return type + '/' + keyToFolder(key)
}

function keyToDbKey (key) {
  return 'archive/' + hex(key)
}
