const crypto = require('hypercore-crypto')
const hyperdb = require('hyperdb')
const events = require('events')
const datenc = require('dat-encoding')
const thunky = require('thunky')
const inherits = require('inherits')

const Archive = require('./archive')

const { hex, chainStorage, keyToFolder } = require('./util')

module.exports = Workspace

function Workspace (storage, key, opts) {
  if (!(this instanceof Workspace)) return new Workspace(storage, key, opts)
  events.EventEmitter.call(this)
  const self = this

  this.key = key || null

  this.archives = []
  this._byKey = {}

  this.info = {}
  this.opts = opts

  opts.reduce = (a, b) => a
  opts.valueEncoding = 'json'

  this._storage = chainStorage(storage)

  this.db = hyperdb(this._storage('workspace'), key, opts)

  this.ready = thunky((done) => self._ready(done))

  if (opts.info) this.updateInfo(opts.info)
}

inherits(Workspace, events.EventEmitter)

Workspace.prototype._ready = function (done) {
  const self = this
  const rs = this.db.createReadStream('/archives')

  let ready = -1 // not 0 to account for the this.db.get('info)
  let end = false

  rs.on('data', (node) => {
    const archive = this._loadArchive(node.key)
    archive.on('ready', finish)
  })
  rs.on('end', () => { end = true })

  if (this.opts.new && this.opts.info) {
    this.updateInfo(this.opts.info, () => finish())
  } else {
    this.db.get('info', (err, node) => {
      if (err) return
      this.info = node.value
      finish()
    })
  }

  function finish () {
    if (end && ++ready === self.archives.length) done()
  }
}

Workspace.prototype.archive = async function (key, cb) {
  await this.ready()
  key = datenc.toStr(key)
  let archive = null
  if (this._byKey[key]) archive = this.archives[this._byKey[key]]
  cb(null, archive)
  return archive
}

Workspace.prototype.updateInfo = function (info, cb) {
  this.info = Object.assign({}, this.info, info)
  this.db.put('info', this.info, () => {
    this.emit('info.update', this.info)
    if (cb) cb(null, this.info)
  })
}

// Workspace.prototype.mount = function (archive, opts) {
//   this.archives.push(archive)
// }

Workspace.prototype.createArchive = function (info) {
  const keyPair = crypto.keyPair()
  const key = keyPair.publicKey
  const opts = {
    secretKey: keyPair.secretKey,
    info: info
  }

  const archive = this._loadArchive(key, opts)

  this.db.put('archive/' + datenc.toStr(key), {
    added: Date.now() / 1000,
    key: datenc.toStr(key),
    source: true
  })

  return archive
}

Workspace.prototype.addArchive = function (key, opts) {
  if (this._byKey[key]) return

  const archive = this._loadArchive(key, opts)

  this.db.put('archive/' + datenc.toStr(key), {
    added: Date.now() / 1000,
    key: datenc.toStr(datenc.toStr(key)),
    source: false
  })

  return archive
}

Workspace.prototype._loadArchive = function (key, opts) {
  key = datenc.toBuf(key)
  const name = 'archive/' + keyToFolder(key)
  const archive = Archive(this._storage(name), key, opts)
  archive.ready(() => this._pushArchive(archive))
  return archive
}

Workspace.prototype._pushArchive = function (archive) {
  const idx = this.archives.push(archive)
  this._byKey[hex(archive.key)] = idx - 1
  this.emit('archive', archive)
}

// Workspace.prototype.__hyperpc = function () {
//   const self = this
//   return {
//     archive: (key, cb) => self.archive(key) ? rpcify(self.archive(key)) :
//   }
// }
