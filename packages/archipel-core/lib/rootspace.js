const events = require('events')
const inherits = require('inherits')
const hyperdb = require('hyperdb')
const pify = require('pify')
const datenc = require('dat-encoding')
const crypto = require('hypercore-crypto')
const thunky = require('thunky')

const Workspace = require('./workspace')

const { hex, ready, keyToFolder, chainStorage } = require('./util')

module.exports = Rootspace

function Rootspace (storage, key, opts) {
  if (!(this instanceof Rootspace)) return new Rootspace(storage, key, opts)
  events.EventEmitter.call(this)
  const self = this

  this.workspaces = []
  this.archives = []
  this._workspaceKeys = {}
  this._archiveKeys = {}

  this._storage = chainStorage(storage)

  this.db = hyperdb(this._storage('root'), key, {
    valueEncoding: 'json',
    reduce: (a, b) => a
  })

  this.ready = thunky((done) => self._ready(done))
}

inherits(Rootspace, events.EventEmitter)

Rootspace.prototype._ready = function (done) {
  this.db.ready(done)
}

Rootspace.prototype.getWorkspace = async function (key, cb) {
  key = hex(key)
  if (this._workspaceKeys[key]) return this.workspaces[this._workspaceKeys[key]]

  let node = await pify(this.db.get('workspace/' + key))
  // check access here.
  if (node.value && node.value.key) {
    return this._loadWorkspace(node.value.key, node.value)
  }
}

Rootspace.prototype.createWorkspace = function (info) {
  const keyPair = crypto.keyPair()
  const key = keyPair.publicKey
  const opts = {
    secretKey: keyPair.secretKey,
    new: true,
    info: info || {}
  }

  const workspace = this._loadWorkspace(key, opts)

  this.db.put(this._dbKey(workspace), {
    created: Date.now() / 1000,
    key: hex(workspace.key),
    authorized: true
  })

  return workspace
}

Rootspace.prototype.getArchive = function (key) {
  if (!this._archiveKeys[key]) return null
  return this.archives[this._archiveKeys[key]]
}

Rootspace.prototype._init = async function () {
  await ready(this.db.ready)
  this.db.get('workspaces')
}

Rootspace.prototype._loadWorkspace = function (key, opts) {
  key = datenc.toBuf(key)
  const name = 'workspace/' + keyToFolder(key)
  const workspace = Workspace(this._storage(name), key, opts)
  workspace.ready(() => this._pushWorkspace(workspace))
  return workspace
}

Rootspace.prototype._pushWorkspace = function (workspace) {
  const self = this
  const idx = this.workspaces.push(workspace)
  this._workspaceKeys[datenc.toStr(workspace.db.key)] = idx - 1
  this.emit('workspace', workspace)
  workspace.on('archive', (archive) => {
    const idx = self.archives.push(archive)
    self._archiveKeys[datenc.toStr(archive.key)] = idx - 1
    this.emit('archive', archive)
  })

  // workspace.on('info.update', (info) => self._updateWorkspaceInfo(workspace))
}

// Rootspace.prototype._updateWorkspaceInfo = function (workspace) {
//   this.db.get(this._dbKey(workspace), (err, node) => {
//     if (err) return
//     node.info = workspace.info
//     this.info = workspace.info
//     this.db.put(this._dbKey(workspace), node)
//   })
// }

Rootspace.prototype._dbKey = function (workspace) {
  return 'workspace/' + datenc.toStr(workspace.key)
}
