const hyperdb = require('hyperdb')
const events = require('events')
const hyperdiscovery = require('hyperdiscovery')
const inherits = require('inherits')

const library = require('./library')
const { hex, chainStorage, asyncThunk } = require('./util')

module.exports = Workspace

function Workspace (storage, key, opts) {
  if (!(this instanceof Workspace)) return new Workspace(storage, key, opts)
  opts = opts || {}

  this.library = library(storage, { archiveTypes: opts.archiveTypes })

  this.key = key
  this.info = {}

  this.db = hyperdb(chainStorage(storage)('workspace'), key, {
    reduce: (a, b) => a,
    valueEncoding: 'json'
  })

  this.ready = asyncThunk(this._ready.bind(this))
}
inherits(Workspace, events.EventEmitter)

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
      const { type, key, opts, status } = node.value
      console.log('openArchive', node.value)
      return self.library.addArchive(type, key, opts, status)
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

Workspace.prototype.getArchive = async function (key) {
  return this.library.getArchive(key)
}

Workspace.prototype.createArchive = async function (type, info, opts) {
  const archive = await this.library.createArchive(type, opts)
  archive.setState({ share: false })
  if (info && archive.setInfo) await archive.setInfo(info)
  this.saveArchive(archive.key)
  return archive
}

Workspace.prototype.addRemoteArchive = async function (type, key, opts) {
  const archive = await this.library.addRemoteArchive(type, key, opts)
  this.saveArchive(archive.key)
  // todo: share.
  return archive
}

Workspace.prototype.getPrimaryArchivesWithInfo = async function () {
  const self = this
  await this.ready()
  let archives = this.library.getPrimaryArchives()
  return Promise.all(archives.map(archive => self.getStatusAndInfo(archive.key)))
}

Workspace.prototype.getStatusAndInfo = async function (key) {
  let archive = this.library.getArchive(key)
  await archive.ready()
  let info = await archive.getInfo()
  let status = archive.getState()
  return { info, status, key: archive.key }
}

Workspace.prototype.saveArchive = async function (key) {
  const self = this
  const archive = this.library.getArchive(key)

  const value = {
    key,
    type: archive.type,
    status: archive.getState(),
    opts: {} // todo: support opts?
  }

  return new Promise((resolve, reject) => {
    let dbkey = keyToDbKey(key)
    self.db.put(dbkey, value, (err, res) => {
      return err ? reject(err) : resolve(value)
    })
  })
}

Workspace.prototype.setShare = async function (key, share) {
  const archive = this.library.getArchive(key)

  archive.setState({ share })
  this.saveArchive(archive.key)

  if (share) return this._doShare(archive)
  else return this._doUnshare(archive)
}

Workspace.prototype._doShare = async function (archive) {
  const instance = archive.getInstance()
  await instance.ready()
  const network = hyperdiscovery(instance)
  archive.network = network
  network.on('connection', (peer) => console.log('got peer!'))
}

Workspace.prototype._doUnshare = async function (archive) {
  if (archive.network) archive.network.close()
}

function keyToDbKey (key) {
  return 'archive/' + hex(key)
}
