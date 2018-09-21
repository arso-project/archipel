const EventEmitter = require('events').EventEmitter
const inherits = require('inherits')
const debug = require('debug')('session')
const hyperpc = require('hyperpc')
const pump = require('pump')
const rpcify = hyperpc.rpcify
const { Rootspace } = require('@archipel/core')

module.exports = Session

function Session (Root, stream, opts) {
  if (!(this instanceof Session)) return new Session(Root, stream, opts)
  EventEmitter.call(this)
  this.Root = Root
  this.stream = stream
  this.opts = opts

  this.workspace = null

  this.init()
}

inherits(Session, EventEmitter)

Session.prototype.init = function () {
  const self = this
  debug('init. req url: %s', this.opts.req.url)
  const api = {
    action: (action, cb) => self.onAction(action, cb),
    rootspace: rpcify(Rootspace, { factory: () => self.Root })
    // workspace: async (key) => rpcify(this.workspace)
  }
  this.rpc = hyperpc(api, {promise: true, debug: true})
  pump(this.rpc, this.stream, this.rpc)
  this.rpc.on('remote', this.onRemote.bind(this))
}

Session.prototype.onAction = async function (action, cb) {
  if (!action.args) action.args = {}
  debug('action: %o', action)
  let workspace
  switch (action.name) {
    case 'GET_WORKSPACES':
      return this.Root.getWorkspaces(cb)
    case 'CREATE_WORKSPACE':
      workspace = await this.Root.createWorkspace(action.args)
      this.workspace = workspace
      return cb(null, this.workspace.info)
    case 'OPEN_WORKSPACE':
      workspace = await this.Root.getWorkspace(action.args.key)
      if (workspace) {
        this.workspace = workspace
        cb(null, this.workspace.info)
      } else cb(new Error('Not found.'), null)
  }
}

Session.prototype.onRemote = function (remote) {
  this.remote = remote
  debug('remote: %o', remote)
}
