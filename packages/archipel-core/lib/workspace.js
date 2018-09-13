const crypto = require('hypercore-crypto')
const Archive = require('./archive')
const path = require('path')
const hyperdb = require('hyperdb')
const events = require('events')
const datenc = require('dat-encoding')
const thunky = require('thunky')

const { hex, discoveryKey, ready } = require('./util')

function Workspace (storage, key, opts) {
  if (!(this instanceof Workspace)) return new Workspace(storage, key, opts)
  events.EventEmitter.call(this)

  this.archives = []
  this._byKey = {}

  opts.reduce = (a, b) => a
  opts.valueEncoding = 'json'

  this._storage = typeof storage === 'string' ? this._defaultStorage(storage) : storage

  this.db = hyperdb(this._storage('workspace'), key, opts)

  this.ready = ready(thunky(this._ready))
}

Workspace.prototype._ready = async function (done) {
  const rs = this.db.createReadStream('/archives')

  let ready = 0
  let end = false

  rs.on('data', (node) => {
    const archive = this._loadArchive(node.key)
    archive.on('ready', finish)
  })
  rs.on('end', () => { end = true })

  function finish () {
    if (end && ++ready === this.archives.length) done()
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

Workspace.prototype.mount = function (archive, opts) {
  this.archives.push(archive)
}

Workspace.prototype.createArchive = async function (info) {
  const { key, secretKey } = crypto.keypair
  const opts = {
    secretKey: secretKey,
    info: info
  }

  this._loadArchive(key, opts)

  this.db.put('archive/' + datenc.toStr(key), {
    created: Date.now() / 1000,
    key: datenc.toStr(datenc.toStr(key)),
    authorized: true
  })
}

Workspace.prototype._loadArchive = function (key, opts) {
  key = datenc.toBuf(key)
  const discovery = discoveryKey(key)
  const name = 'archive/' + discovery
  const archive = Archive(this._storage(name), key, opts)
  archive.ready(() => this._pushArchive(archive))
  return archive
}

Workspace.prototype._pushArchive = function (archive) {
  const idx = this.archives.push(archive)
  this._byKey[hex(archive.key)] = idx - 1
}

Workspace.prototype._defaultStorage = function (dir) {
  const discovery = discoveryKey(this.key)
  return function (name) {
    return path.join(dir, discovery, name)
  }
}
