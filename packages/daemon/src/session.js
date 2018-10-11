const EventEmitter = require('events').EventEmitter
const inherits = require('inherits')
const debug = require('debug')('session')
const hyperpc = require('hyperpc')
const pump = require('pump')
const pify = require('pify')
const { features } = require('@archipel/core')

module.exports = Session

function Session (Root, stream, opts) {
  if (!(this instanceof Session)) return new Session(Root, stream, opts)
  EventEmitter.call(this)
  this.Root = Root
  this.stream = stream
  this.opts = opts

  this.workspace = null

  this.actionHandlers = features.filter(feature => feature.onAction).map(feature => feature.onAction)
  this.actionHandlers.push(onWorkspaceAction)

  this.init()
}

inherits(Session, EventEmitter)

Session.prototype.init = function () {
  const self = this
  debug('init. req url: %s', this.opts.req.url)
  const api = {
    action: (action, cb) => self.onAction(action, null, cb),
    actionStream: (action, stream, cb) => self.onAction(action, stream, cb),
  }
  this.rpc = hyperpc(api, {promise: true, debug: true})
  pump(this.rpc, this.stream, this.rpc)
  this.rpc.on('remote', this.onRemote.bind(this))
}

Session.prototype.onAction = async function (action, stream, cb) {
  this.actionHandlers.forEach(onAction => onAction(action, stream, this, send))

  function send (action) {
    debug('SEND %O', action)
    cb(action)
  }
}

Session.prototype.onRemote = function (remote) {
  this.remote = remote
  debug('remote: %o', remote)
}

async function onWorkspaceAction (action, stream, session, send) {
  switch (action.type) {
    case 'WORKSPACE_LIST': return send(await listWorkspaces(session, action))
    case 'WORKSPACE_OPEN': return send(await openWorkspace(session, action))
    case 'WORKSPACE_CREATE': return send(await createWorkspace(session, action))
    case 'ARCHIVES_LOAD': return send(await loadArchives(session, action))
    case 'ARCHIVE_CREATE': return send(await createArchive(session, action))
  }
  return null
}

async function loadArchives (session, action) {
  if (!session.workspace) return error(action, 'No workspace.')
  const workspace = session.workspace
  const archives = await workspace.getArchives()
  return result(action, archives)
}

async function createArchive (session, action) {
  if (!session.workspace) return error(action, 'No workspace.')
  const workspace = session.workspace
  const archive = await workspace.createArchive(action.payload)
  await archive.ready()
  return result(action, archive.info)
}

async function listWorkspaces (session, action) {
  // todo: permission checking.
  try {
    const res = await session.Root.getWorkspaces()
    return result(action, res)
  } catch (err) {
    console.log('listWorkspaces ERROR', err)
    // return error(action, err)
  }
}

async function openWorkspace (session, action) {
  try {
    const workspace = await session.Root.getWorkspace(action.payload)
    if (workspace) {
      session.workspace = workspace
      await session.workspace.ready()
      return result(action, session.workspace.info)
    } else return error(action, 'Not found.')
  } catch (e) {
    console.log('openWorkspace ERROR', e)
  }
}

async function createWorkspace (session, action) {
  try {
    const info = action.payload
    const workspace = await session.Root.createWorkspace(info)
    if (workspace) {
      session.workspace = workspace
      await session.workspace.ready()
      return result(action, session.workspace.info)
    } else error('Not found.')
  } catch (e) {
    console.log(e)
  }
  // const { title } = action.payload
}

function result (action, res) {
  return {
    ...action,
    error: false,
    payload: res,
    pending: false
  }
}

function error (action, err) {
  return {
    ...action,
    error: true,
    payload: err,
    pending: false
  }
}
