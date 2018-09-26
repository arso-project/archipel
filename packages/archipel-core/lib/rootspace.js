const events = require('events')
const inherits = require('inherits')
const hyperdb = require('hyperdb')
const pify = require('pify')
const datenc = require('dat-encoding')
const crypto = require('hypercore-crypto')
const thunky = require('thunky')
const rpcify = require('hyperpc').rpcify
const debug  = require('debug')

const Workspace = require('./workspace')

const { hex, keyToFolder, chainStorage, ready } = require('./util')

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

Rootspace.prototype.getWorkspaces = async function (cb) {
  try {
    let workspaces = await pify(this.db.list.bind(this.db))('workspace')
    if (workspaces) workspaces = workspaces.map(ws => ws.value)
    if (cb) cb(workspaces)
    else return workspaces
  } catch (e) {
    if (cb) return cb(e)
    else return e
  }
}

Rootspace.prototype.getWorkspace = async function (key) {
  key = hex(key)
  if (this._workspaceKeys[key]) return this.workspaces[this._workspaceKeys[key]]
  const spaces = await this.getWorkspaces()
  const authorizedByKey = spaces.reduce((r, sp) => {
    if (sp.authorized) r[sp.key] = sp
    return r
  }, {})


  if (authorizedByKey[key]) {
    return this._openWorkspace(key, authorizedByKey[key])
  } else throw new Error('Workspace not found or not authorized.')

  // let node = await pify(this.db.get.bind(this.db))('workspace/' + key)
  // check access here.
  // if (node.value && node.value.key) {
  //   return this._openWorkspace(node.value.key, node.value)
  // }
}

Rootspace.prototype.getDefaultWorkspace = async function (opts) {
  const spaces = await this.getWorkspaces()
  if (!spaces) return null
  return this.getWorkspace(spaces[0].key)
}

Rootspace.prototype.createWorkspace = async function (info) {
  const keyPair = crypto.keyPair()
  const key = keyPair.publicKey
  const opts = {
    secretKey: keyPair.secretKey,
    new: true,
    info: info || {}
  }

  const workspace = await this._openWorkspace(key, opts)

  const workspaceInfo = {
    created: Date.now() / 1000,
    key: hex(workspace.key),
    authorized: true,
    info: {}
  }

  this._saveWorkspace(workspace, workspaceInfo)

  return workspace
}

Rootspace.prototype._saveWorkspace = function (workspace, data) {
  this.db.get(this._dbKey(workspace), (err, node) => {
    let value
    if (!node) value = {}
    else value = node.value
    const newValue = Object.assign({}, value, data)
    console.log('sve', newValue)
    this.db.put(this._dbKey(workspace), newValue)
  })
}

Rootspace.prototype.getArchive = function (key) {
  if (!this._archiveKeys[key]) return null
  return this.archives[this._archiveKeys[key]]
}

Rootspace.prototype._openWorkspace = async function (key, opts) {
  key = datenc.toBuf(key)
  const name = 'workspace/' + keyToFolder(key)
  const workspace = Workspace(this._storage(name), key, opts)
  await workspace.ready()
  this._pushWorkspace(workspace)
  return workspace
}

Rootspace.prototype._pushWorkspace = function (workspace) {
  const self = this
  const idx = this.workspaces.push(workspace)
  this._workspaceKeys[datenc.toStr(workspace.db.key)] = idx - 1
  this.emit('workspace', workspace)
  workspace.on('info.update', (info) => {
    this._saveWorkspace(workspace, { info })
  })
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

// Rootspace.__hyperpc = {
//   include: [
//     'getWorkspace',
//     'getDefaultWorkspace',
//     'createWorkspace',
//     'getWorkspaces'
//   ],
//   override: {
//     getWorkspace: async function (key) { return rpcify(await this.getWorkspace(key)) },
//     getDefaultWorkspace: async function (opts) { return rpcify(await this.getDefaultWorkspace(opts) )}
//   }
// }
