const events = require('events')
const inherits = require('inherits')
const hyperdb = require('hyperdb')
const pify = require('pify')
const datenc = require('dat-encoding')
const crypto = require('hypercore-crypto')

const Workspace = require('./workspace.js')

const { asyncThunky, hex, keyToFolder, chainStorage } = require('./util')

module.exports = WorkspaceManager

function WorkspaceManager (storage, key, opts) {
  if (!(this instanceof WorkspaceManager)) return new WorkspaceManager(storage, key, opts)
  this.workspaces = []
  this.storage = chainStorage(storage)

  this.db = hyperdb(this.storage('root'), key, {
    valueEncoding: 'json',
    reduce: (a, b) => a
  })

  this.ready = asyncThunky(this._ready.bind(this))

  this.archiveTypes = {}
}
inherits(WorkspaceManager, events.EventEmitter)

WorkspaceManager.prototype._ready = function (done) {
  this.db.ready(done)
}

WorkspaceManager.prototype.registerArchiveTypes = function (archiveTypes) {
  this.archiveTypes = archiveTypes
}

WorkspaceManager.prototype.getWorkspaces = async function () {
  let workspaces = await pify(this.db.list.bind(this.db))('workspace')
  if (workspaces) workspaces = workspaces.map(ws => ws.value)
  return workspaces
}

WorkspaceManager.prototype.getWorkspace = async function (key) {
  if (this.workspaces[key]) return this.workspaces[key]

  const spaces = await this.getWorkspaces()
  if (!spaces.find(ws => ws.key === key)) throw new Error('Workspace ' + key + ' not found.')
  return this._openWorkspace(key)
}

WorkspaceManager.prototype.createWorkspace = async function (info) {
  const keyPair = crypto.keyPair()
  const key = keyPair.publicKey
  const opts = {
    secretKey: keyPair.secretKey
  }

  const workspace = await this._openWorkspace(key, opts)
  await workspace.setInfo(info)

  const workspaceStatus = {
    created: Date.now() / 1000,
    key: hex(workspace.key),
    authorized: true,
    info: info
  }

  this._saveWorkspace(workspace, workspaceStatus)

  return workspace
}

WorkspaceManager.prototype._saveWorkspace = function (workspace, data) {
  this.db.get(dbKey(workspace), (err, node) => {
    if (err) return // todo
    let value = node ? node.value : {}
    const newValue = Object.assign({}, value, data)
    this.db.put(dbKey(workspace), newValue)
  })
}

WorkspaceManager.prototype._openWorkspace = async function (key, opts) {
  opts = opts || {}
  key = datenc.toBuf(key)
  const name = 'workspace/' + keyToFolder(key)
  opts.archiveTypes = this.archiveTypes
  const workspace = Workspace(this.storage(name), key, opts)
  await workspace.ready()
  this.workspaces[key] = workspace
  return workspace
}

function dbKey (workspace) {
  return 'workspace/' + datenc.toStr(workspace.key)
}
