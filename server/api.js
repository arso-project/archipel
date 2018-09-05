var path = require('path')
var debug = require('./api-debug.js')
var WorkspaceManager = require('./workspace').WorkspaceManager

var rootPath = process.env.ARCHIPEL_ROOT_PATH || path.join(__dirname, '..', 'db')
var Workspaces = WorkspaceManager(rootPath)

var api = {
  debug: {
    ...debug
  },

  getWorkspaces: (cb) => Workspaces.getWorkspaces(cb),
  openWorkspace: (key, cb) => Workspaces.openWorkspaceToRemote(key, cb),
  createWorkspace: (title, cb) => Workspaces.createWorkspace(title, cb),

  workspace: {
    getArchives: (wsk, cb) => {
      getWorkspace(wsk, (err, ws) => err ? cb(err) : ws.getArchives(cb))
    },
    createArchive: (wsk, title, cb) => {
      getWorkspace(wsk, (err, ws) => err ? cb(err) : ws.createArchive(title, cb))
    },
    addArchive: (wsk, key, cb) => {
      getWorkspace(wsk, (err, ws) => err ? cb(err) : ws.addArchive(key, cb))
    },
    setTitle: (wsk, title, cb) => {
      getWorkspace(wsk, (err, ws) => err ? cb(err) : ws.setTitle(title, cb))
    },

    drive: {
      readdir: (wsk, key, path, cb) => {
        getDrive(wsk, key, (err, drive) => err ? cb(err) : drive.readdir(path, cb))
      },
      stat: (wsk, key, path, cb) => {
        getDrive(wsk, key, (err, drive) => err ? cb(err) : drive.stat(path, cb))
      },
      mkdir: (wsk, key, path, opts, cb) => {
        getDrive(wsk, key, (err, drive) => err ? cb(err) : drive.mkdir(path, opts, cb))
      },
      readFile: (wsk, key, path, cb) => {
        getDrive(wsk, key, (err, drive) => err ? cb(err) : drive.readFile(path, cb))
      },
      writeFile: (wsk, key, path, buf, opts, cb) => {
        getDrive(wsk, key, (err, drive) => err ? cb(err) : drive.writeFile(path, buf, opts, cb))
      }
    },

    graph: {
      query: (wsk, key, q, cb) => {
        getGraph(wsk, key, (err, graph) => err ? cb(err) : graph.query(q, cb))
      },
      get: (wsk, key, triple, opts, cb) => {
        getGraph(wsk, key, (err, graph) => err ? cb(err) : graph.get(triple, opts, cb))
      },
      getStream: (wsk, key, triple, opts, cb) => {
        getGraph(wsk, key, (err, graph) => err ? cb(err) : cb(null, graph.getStream(triple, opts)))
      },
      put: (wsk, key, triple, cb) => {
        getGraph(wsk, key, (err, graph) => err ? cb(err) : graph.put(triple, cb))
      }
    }
  }
}

function getDrive (wsk, key, cb) {
  var ws = Workspaces.openWorkspace(wsk)
  if (!ws) return cb(new Error('No workspace with key %s.', wsk))
  var drive = ws.getDrive(key, cb)
  if (!drive) return cb(new Error('No drive with key %s.', key))
  cb(null, drive)
}

function getGraph (wsk, key, cb) {
  var ws = Workspaces.openWorkspace(wsk)
  if (!ws) return cb(new Error('No workspace with key %s.', wsk))
  var drive = ws.getGraph(key, cb)
  if (!drive) return cb(new Error('No drive with key %s.', key))
  cb(null, drive)
}

function getWorkspace (wsk, cb) {
  var ws = Workspaces.openWorkspace(wsk)
  if (!ws) return cb(new Error('No workspace with key %s.', wsk))
  cb(null, ws)
}

module.exports = api
