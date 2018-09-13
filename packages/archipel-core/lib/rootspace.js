const events = require('events')
const inherits = require('inherits')
const hyperdb = require('hyperdb')
// const maybe = require('call-me-maybe')
const pify = require('pify')
const datenc = require('datenc')

const Workspace = require('./workspace')

const { hex, ready } = require('./util')

function Rootspace (storage, key, opts) {
  if (!(this instanceof Rootspace)) return new Rootspace(storage, key, opts)
  events.EventEmitter.call(this)

  this.workspaces = []
  this._byKey = {}

  this._storage = typeof storage === 'string' ? this._defaultStorage(storage) : storage

  this.db = hyperdb(storage, key, {
    valueEncoding: 'json' ,
    reduce: (a, b) => a
  })
}

inherits(Rootspace, events.EventEmitter)

Rootspace.prototype.getWorkspace = async function (key, cb) {
  key = hex(key)
  if (this._byKey[key]) return this.workspaces[this._byKey[key]]

  let node = await pify(this.db.get('workspace/' + key))
  // check access here.
  if (node.value) {
    this._pushWorkspace(key)
  }
}

Rootspace.prototype.createWorkspace = async function (info) {
  const { key, secretKey } = crypto.keypair
  const opts = {
    secretKey: secretKey,
    info: info
  }

  const workspace = this._loadWorkspace(key, opts)

  await workspace.ready()

  this.db.put('workspace/' + datenc.toStr(workspace.key), {
    created: Date.now() / 1000,
    key: hex(workspace.key),
    authorized: true
  })
  this._pushWorkspace(workspace)
}

Rootspace.prototype._init = async function () {
  await ready(this.db.ready)
  this.db.get('workspaces')
}

Workspace.prototype._loadWorkspace = function (key, opts) {
  key = datenc.toBuf(key)
  const discovery = discoveryKey(key)
  const name = 'workspace/' + discovery
  const workspace = Workspace(this._storage(name), key, opts)
  workspace.ready(() => this._pushWorkspace(workspace))
  return workspace
}

Rootspace.prototype._pushWorkspace = async function (workspace) {
  const idx = this.workspaces.push(workspace)
  this._byKey[datenc.toStr(workspace.key)] = idx - 1
}
