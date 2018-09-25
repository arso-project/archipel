import rpc from './rpc.js'
import Stat from 'hyperdrive/lib/stat.js'

export function openWorkspace (key) {
  return Workspace(key)
}

export function getWorkspaces (cb) {
  rpc(api => api.getWorkspaces(cb))
}

export function createWorkspace (title, cb) {
  rpc(api => api.createWorkspace(title, cb))
}

function Workspace (key) {
  if (!(this instanceof Workspace)) return new Workspace(key)
  console.log('init workspace', key)
  this.wsk = key
}

Workspace.prototype.getArchives = function (cb) {
  rpc(api => api.workspace.getArchives(this.wsk, cb))
}

Workspace.prototype.createArchive = function (title, cb) {
  rpc(api => api.workspace.createArchive(this.wsk, title, cb))
}

Workspace.prototype.addArchive = function (key, cb) {
  rpc(api => api.workspace.addArchive(this.wsk, key, cb))
}

Workspace.prototype.setTitle = function (title, cb) {
  rpc(api => api.workspace.setTitle(this.wsk, title, cb))
}

Workspace.prototype.getDrive = function (key, cb) {
  rpc((api) => {
    var drive = {
      key: key,
      readdir: (path, cb) => api.workspace.drive.readdir(this.wsk, key, path, cb),
      stat: (path, cb) => api.workspace.drive.stat(this.wsk, key, path, (err, data) => {
        if (err) return cb(err)
        var stat = Stat(data)
        cb(null, stat)
      }),
      mkdir: (path, opts, cb) => api.workspace.drive.mkdir(this.wsk, key, path, opts, cb),
      readFile: (path, cb) => api.workspace.drive.readFile(this.wsk, key, path, cb),
      writeFile: (path, buf, opts, cb) => api.workspace.drive.writeFile(this.wsk, key, path, buf, opts, cb)
    }
    cb(null, drive)
  })
}

Workspace.prototype.getGraph = function (key, cb) {
  rpc((api) => {
    var graph = {
      key: key,
      query: (q, cb) => api.workspace.graph.query(this.wsk, key, q, cb),
      get: (triple, opts, cb) => api.workspace.graph.get(this.wsk, key, triple, opts, cb),
      getStream: (triple, opts, cb) => api.workspace.graph.getStream(this.wsk, key, triple, opts, cb),
      put: (triple, cb) => api.workspace.graph.put(this.wsk, key, triple, cb)
    }
    cb(null, graph)
  })
}
