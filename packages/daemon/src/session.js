const EventEmitter = require('events').EventEmitter
const inherits = require('inherits')
const debug = require('debug')('session')
const hyperpc = require('hyperpc')
const pump = require('pump')
const rpcify = hyperpc.rpcify
const pify = require('pify')
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
  debug('RECEIVE %O', action)
  try {
    switch (action.type) {
      case 'WORKSPACE_LIST':
        // todo: permission checking.
        this.Root.getWorkspaces()
          .then(res => result(res))
          .catch(err => error(err))
        break

      case 'WORKSPACE_OPEN':
        const workspace = await this.Root.getWorkspace(action.payload)
        if (workspace) {
          this.workspace = workspace
          await this.workspace.ready()
          result(this.workspace.info)
        } else error('Not found.')
        break

      case 'ARCHIVES_LOAD':
        if (!this.workspace) return error('No workspace.')
        this.workspace.getArchives()
          .then(res => result(res))
          .catch(err => error(err))
        break

      case 'DIRLIST_LOAD':
        if (!this.workspace) return error('No workspace.')
        const { id, dir } = action.meta
        const archive = await this.workspace.archive(id)
        if (!archive) return error('Archive not found.')
        await archive.ready()
        const fs = archive.fs
        let readdir = await fs.readdir(dir)
        const stats = readdir.map(async name => {
          const stat = await fs.stat(dir)
          return {
            path: dir,
            name,
            isDirectory: stat.isDirectory()
          }
        })
        Promise.all(stats).then(completed => {
          result(completed)
        })
    }
  } catch (e) {
    console.log(e)
    throw e
  }

  function result (res) {
    send({
      ...action,
      error: false,
      payload: res,
      meta: { ...action.meta, pending: false }
    })
  }

  function error (err) {
    send({
      ...action,
      error: true,
      payload: err,
      meta: { ...action.meta, pending: false }
    })
  }

  function send (action) {
    debug('SEND %O', action)
    cb(action)
  }
}

Session.prototype.onRemote = function (remote) {
  this.remote = remote
  debug('remote: %o', remote)
}
