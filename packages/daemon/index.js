const { Rootspace } = require('@archipel/core')
const config = require('./src/config.js')
const websocket = require('./src/websocket.js')
const Session = require('./src/session')
const EventEmitter = require('events').EventEmitter
const inherits = require('inherits')
const debug = require('debug')('daemon')

module.exports = Daemon

function Daemon (opts) {
  if (!(this instanceof Daemon)) return new Daemon(opts)
  EventEmitter.call(this)

  opts = opts || {}

  this.config = opts.config || config()
  debug('config: %O', this.config)
  this.root = Rootspace(this.config.dbPath)
  this.sessions = []

  // this.root.getWorkspaces().then(res => console.log(res))

  let server = null
  if (typeof opts.server === 'function') server = opts.server(this.config)
  if (typeof opts.server === 'undefined') server = require('./src/server')(this.config)
  this.server = server

  this.ws = websocket(Object.assign({}, opts, { server }), this.onConnection.bind(this))
  if (this.server) {
    this.server.listen(this.config.port, () => console.log('Server listening on port %s', this.config.port))
    this.server.on('error', (e) => this.emit('error', e))
  }
  this.emit('ready')
}

inherits(Daemon, EventEmitter)

Daemon.prototype.onConnection = function (stream, req) {
  debug('handle connection, url: %s', req.url)
  if (req.url === '/rpc') {
    const session = Session(this.root, stream, { req })
    this.sessions.push(session)
  }
}
