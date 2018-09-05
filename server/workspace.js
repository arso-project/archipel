var hyperdb = require('hyperdb')
var hyperdrive = require('hyperdrive')
var hypergraph = require('hyper-graph-db')
var crypto = require('hypercore/lib/crypto.js')
var path = require('path')
var thunky = require('thunky')
var debug = require('debug')('archipel-store')

var CONSTRUCTORS = {
  drive: hyperdrive,
  graph: hypergraph,
  db: hyperdb
}

// Workspace Manager.

module.exports = {
  WorkspaceManager,
  Workspace
}

function WorkspaceManager (rootPath) {
  if (!(this instanceof WorkspaceManager)) return new WorkspaceManager(rootPath)
  this.rootPath = rootPath
  this.rootDb = hyperdb(path.join(this.rootPath, 'root'), {valueEncoding: 'json'})
  this.info = {}
  this.spaces = {}
  this.init = false
  this.ready = thunky(this._init.bind(this))
  this.ready()
}

WorkspaceManager.prototype._init = function (cb) {
  var self = this
  this.rootDb.ready(() => {
    debug('Workspace root path %s and key %s', this.rootPath, this.rootDb.key.toString('hex'))
    self.loadWorkspaces(cb)
  })
}

WorkspaceManager.prototype.loadWorkspaces = function (cb) {
  var self = this
  if (!cb) cb = noop()
  var rs = this.rootDb.createReadStream('/spaces')
  rs.on('data', (nodes) => {
    var value = nodes[0].value
    self.info[value.key] = value
  })
  rs.on('end', () => {
    self.init = true
    cb()
  })
}

WorkspaceManager.prototype.getWorkspaces = function (cb) {
  var self = this
  debug('get workspaces: %o', self.info)
  this.ready(() => cb(null, self.info))
}

WorkspaceManager.prototype.openWorkspace = function (key) {
  if (!this.info[key]) return false
  if (!this.spaces[key]) {
    this.spaces[key] = Workspace(this.workspacePath(key), key)
  }
  return this.spaces[key]
}

WorkspaceManager.prototype.openWorkspaceToRemote = function (key, cb) {
  this.openWorkspace(key, (err, space) => {
    if (err) return cb(err)
    cb(space.remoteApi())
  })
}

WorkspaceManager.prototype.workspacePath = function (key) {
  key = hex(key)
  var wsPath = path.join(this.rootPath, 'spaces', key.slice(0, 2), key.slice(2))
  debug('workspace path: %s', wsPath)
  return wsPath
}

WorkspaceManager.prototype.createWorkspace = function (title, cb) {
  var [key, opts] = keypairAndOpts()
  var space = Workspace(this.workspacePath(key), key, opts)
  this.rootDb.put('/spaces/' + hex(key), {key: hex(key), title})
  space.setTitle(title)
  space.ready(cb)
  debug('created workspace ' + title + ' / ' + key)
  this.loadWorkspaces()
}

// Workspace

function Workspace (rootPath, key, opts) {
  if (!(this instanceof Workspace)) return new Workspace(rootPath, key, opts)
  this.key = key
  this.rootPath = rootPath

  this.info = {
    archives: {},
    drive: {},
    graph: {}
  }

  this.drive = {}
  this.graph = {}

  var defaults = {
    valueEncoding: 'json',
    reduce: (a, b) => a
  }
  opts = Object.assign({}, defaults, opts)
  this.db = hyperdb(path.join(this.rootPath, 'space'), key, opts)

  debug('Init workspace %s at path %s', key, rootPath)

  this.ready = thunky(this._init.bind(this))
}

Workspace.prototype._init = function (cb) {
  var self = this
  this._loadArchives((err, archives) => {
    if (err) return cb(err)
    this.db.watch('/archives', () => self._loadArchives())
    cb()
    debug('workspace init done, key %s, archives %o', self.key, self.info)
    this.db.get('title', (err, node) => {
      if (err) return // todo: handle
      if (node) self.info.title = node.value
    })
  })
}

Workspace.prototype.getDrive = function (key, cb) {
  debug('open drive %s', key)
  return this._openByType('drive', key, cb)
}

Workspace.prototype.getGraph = function (key, cb) {
  return this._openByType('graph', key, cb)
}

Workspace.prototype.setTitle = function (title) {
  this.db.put('title', title)
}

Workspace.prototype._openByType = function (type, key, cb) {
  if (!CONSTRUCTORS[type]) return error(new Error('No constructor for type ' + type))
  // todo: check for existence.
  // if (!this.info[type][key]) return error(new Error('Drive ' + key + ' not found.'))
  // if (this[type][key]) return this[type][key]

  var opts = {}
  if (this.info[type][key].secretKey) opts.secretKey = this.info[type][key].secretKey
  this[type][key] = CONSTRUCTORS[type](this.storage(key), key, opts)

  return this[type][key]

  function error (err) {
    cb(err)
    return (f) => f(false)
  }
}

Workspace.prototype.getArchives = function (cb) {
  var self = this
  this.ready(() => {
    debug('get archives! %o', self.info)
    cb(null, self.info.archives)
  })
}

Workspace.prototype._loadArchives = function (cb) {
  var self = this
  var rs = this.db.createReadStream('/archives')
  var archives = []
  rs.on('data', (node) => archives.push(node.value))
  rs.on('end', () => {
    self.info.archives = archives
    self.info.archives.forEach((archive, i) => {
      if (archive.drive) {
        self.info.drive[archive.drive.key] = archive.drive
        self.info.archives[i].key = archive.drive.key // todo: store like this.
      }
      if (archive.graph) self.info.graph[archive.graph.key] = archive.graph
    })
    if (cb) cb(null, archives)
  })
}

Workspace.prototype.createArchive = function (title, cb) {
  debug('Create archive with title "%s"', title)
  var self = this
  var drive = createDrive()
  var graph = createGraph()

  this.drive[hex(drive.key)] = drive
  this.graph[hex(graph.key)] = graph

  var datJson = {
    title,
    url: 'dat://' + hex(drive.key),
    graph: hex(graph.key)
  }

  var triple = {
    subject: 'ROOT',
    predicate: 'archipel:hasDrive',
    object: datJson.url
  }

  drive.writeFile('/dat.json', JSON.stringify(datJson, null, 2), maybeDone)
  graph.put(triple, maybeDone)

  var info = {
    title: title,
    drive: {
      key: hex(drive.key),
      secretKey: hex(drive.secretKey)
    },
    graph: {
      key: hex(graph.key),
      secretKey: hex(graph.secretKey)
    }
  }

  this.db.put('archives/' + hex(drive.key), info, maybeDone)

  var missing = 3
  var errs = []
  function maybeDone (err, data) {
    if (err) errs.push(err)
    if (!--missing) {
      if (!errs.length) {
        debug('Done create archive. %o', info)
        cb(null, info)
      } else cb(new Error(errs.map(e => e.message).join(' | ')))
    }
  }

  function createDrive () {
    var [key, opts] = keypairAndOpts()
    opts.storeSecretKey = false
    var drive = hyperdrive(self.storage(key), key, opts)
    debug('created drive with key %s', key)
    return drive
  }

  function createGraph () {
    var [key, opts] = keypairAndOpts()
    opts.storeSecretKey = false
    var graph = hypergraph(self.storage(key), key, opts)
    debug('created graph with key %s', key)
    return graph
  }
}

Workspace.prototype.storage = function (key) {
  key = hex(key)
  return path.join(this.rootPath, key.slice(0, 2), key.slice(2))
}

Workspace.prototype.addArchive = function (key, cb) {

}

function keypairAndOpts () {
  var keyPair = crypto.keyPair()
  var opts = {
    secretKey: keyPair.secretKey,
    storeSecretKey: true
  }
  var key = keyPair.publicKey.toString('hex')
  return [key, opts]
}

function hex (bufOrStr) {
  if (Buffer.isBuffer(bufOrStr)) return bufOrStr.toString('hex')
  return bufOrStr
}

function noop () {}
