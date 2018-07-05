var hypergraph = require('hyper-graph-db')

// var multi = require('multihyperdb')
// var opts = {
//   path: './db',
//   dbOpts: {valueEncoding: 'json'}
// }
// var Multi = multi(opts)

var dbPath = '/home/gaunab/hyper-readings/testlist1.db'

function Hyperstore (opts) {
  if (!(this instanceof Hyperstore)) return new Hyperstore(opts)
  this.dbs = {}
  var db = hypergraph(dbPath, {valueEncoding: 'uft-8'})
  db.db.ready(() => {
    var key = db.db.key.toString('hex')
    this.dbs[key] = db
  })
}

Hyperstore.prototype.query = function (key, q) {
  if (!key) key = Object.keys(this.dbs)[0]
  return this.dbs[key].getStream(q)
}

module.exports = Hyperstore
