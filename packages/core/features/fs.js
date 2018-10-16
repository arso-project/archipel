const hyperdrive = require('hyperdrive')
const pify = require('pify')

const pump = require('pump')

// module.exports = Fs

const KEY = 'fs'

module.exports = {
  mounts: [{
    name: KEY,
    root: true,
    proxies: 'hyperdrive',
    proxy: Fs
  }],
  onAction,
  plugin: fsPlugin
}

async function fsPlugin (core, opts) {
  core.rpc.reply('fs/stats', async (req, res) => {
    if (!req.session.workspace) throw new Error('No workspace.')
    let [key, ...path] = req.id.split('/')
    path = path.join('/')
    const archive = req.session.workspace.archive(key)
    await archive.ready()
    const fs = archive.fs
    let readdir = await fs.readdir(path)
    const stats = readdir.map(async name => {
      let childpath = [path, name].join('/')
      let id = [key, childpath].join('/')
      const stat = await fs.stat(childpath)
      stats[id] = {
        key,
        id,
        path: childpath,
        name,
        isDirectory: stat.isDirectory()
      }
    })
    const completed = await Promise.all(stats)
    return completed.reduce((ret, stat) => { ret[stat.id] = stat; return ret }, {})
  })
}

// A promisified wrapper around hyperdrive.
function Fs (storage, key, opts) {
  if (!(this instanceof Fs)) return new Fs(storage, key, opts)
  const self = this
  this.hyperdrive = hyperdrive(storage, key, opts)
  this.db = this.hyperdrive.db

  // Copy functions from hyperdrive.
  const asyncFuncs = ['ready', 'readFile', 'writeFile', 'readdir', 'mkdir', 'stat']
  asyncFuncs.forEach(func => {
    self[func] = pify(self.hyperdrive[func].bind(self.hyperdrive))
  })
  const syncFuncs = ['createWriteStream', 'createReadStream']
  syncFuncs.forEach(func => {
    self[func] = self.hyperdrive[func].bind(self.hyperdrive)
  })

  // Copy event bus.
  this.emit = (ev) => this.hyperdrive.emit(ev)
  this.on = (ev, cb) => this.hyperdrive.on(ev, cb)

  // Copy static props.
  const props = ['key', 'discoveryKey', 'db']
  props.forEach(key => {
    self[key] = self.hyperdrive[key]
  })
}

async function onAction (action, stream, session, send) {
  // const [domain, type] = action.type
  // if (domain !== 'fs') return
  const type = action.type
  if (!session.workspace) error(action, 'No workspace')
  const workspace = session.workspace

  switch (type) {
    case 'DIRLIST_LOAD': return send(await dirlistLoad(workspace, action))
    case 'DIR_CREATE': return send(await createDir(workspace, action))
    case 'FILE_LOAD': return send(await fileLoad(workspace, action))
    case 'FILE_WRITE': return send(await fileWrite(workspace, action, stream))
  }
}

async function dirlistLoad (workspace, action) {
  const { key, dir } = action.meta
  const archive = await workspace.archive(key)
  if (!archive) return error(action, 'Archive not found.')
  await archive.ready()
  const fs = archive.fs
  let readdir = await fs.readdir(dir)
  const stats = readdir.map(async name => {
    const stat = await fs.stat([dir, name].join('/'))
    return {
      path: dir,
      name,
      isDirectory: stat.isDirectory()
    }
  })
  const completed = await Promise.all(stats)
  return result(action, completed)
}

async function fileLoad (workspace, action) {
  const { key, file } = action.meta
  const archive = await workspace.archive(key)
  if (!archive) return error(action, 'Archive not found.')
  const res = await archive.fs.readFile(file)
  const str = res.toString()
  return result(action, str)
}

function fileWrite (workspace, action, stream) {
  return new Promise(async (resolve, reject) => {
    try {
      const { key, file } = action.meta
      const archive = await workspace.archive(key)
      if (!archive) return error(action, 'Archive not found.')
      const ws = archive.fs.createWriteStream(file)
      pump(stream, ws)
      ws.on('finish', () => resolve(result(action, true)))
      ws.on('error', (err) => resolve(error(action, err)))
    } catch (e) {
      console.log(e)
    }
  })
}

async function createDir (workspace, action) {
  const { id, dir, name } = action.payload
  const archive = await workspace.archive(id)
  if (!archive) return error(action, 'Archive not found.')
  const path = [dir, name].join('/')
  const res = await archive.fs.mkdir(path)
  return result(action, res)
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
