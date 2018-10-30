const hypergraph = require('hyper-graph-db')
const pify = require('pify')

module.exports = ArchipelHypergraph

function ArchipelHypergraph (storage, key, opts) {
  if (!(this instanceof ArchipelHypergraph)) return new ArchipelHypergraph(storage, key, opts)
  const self = this
  this.hypergraph = hypergraph(storage, key, opts)
  this.db = this.hypergraph.db
  this.key = key

  // Copy functions from hypergraph
  const asyncFuncs = ['ready', 'get', 'put']
  asyncFuncs.forEach(func => {
    self[func] = pify(self.hypergraph[func].bind(self.hypergraph))
  })
  const syncFuncs = ['getStream', 'putStream']
  syncFuncs.forEach(func => {
    self[func] = self.hypergraph[func].bind(self.hypergraph)
  })

  // Copy event bus.
  this.emit = (ev) => this.hypergraph.emit(ev)
  this.on = (ev, cb) => this.hypergraph.on(ev, cb)
}
