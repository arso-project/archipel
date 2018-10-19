const hypergraph = require('hypergraph')

module.exports = {
  name: 'graph-backend',
  plugin,
  mounts: [{
    name: 'graph',
    root: true,
    proxies: 'hypergraph',
    proxy: Graph
  }]
}

async function plugin (core, opts) {
  console.log('register me')
  core.rpc.reply('graph/test', async (req) => {
    return { message: 'hello, world' }
  })
}

// A promisified wrapper around hyperdrive.
function Graph (storage, key, opts) {
  if (!(this instanceof Fs)) return new Fs(storage, key, opts)
  const self = this
  this.hyperdrive = hypergraph(storage, key, opts)
  this.db = this.hyperdrive.db

  // Copy functions from hyperdrive.
  // const asyncFuncs = ['ready', 'readFile', 'writeFile', 'readdir', 'mkdir', 'stat']
  // asyncFuncs.forEach(func => {
  //   self[func] = pify(self.hyperdrive[func].bind(self.hyperdrive))
  // })
  // const syncFuncs = ['createWriteStream', 'createReadStream']
  // syncFuncs.forEach(func => {
  //   self[func] = self.hyperdrive[func].bind(self.hyperdrive)
  // })

  // this.asyncWriteStream = (path, stream) => {
  //   return new Promise ((resolve, reject) => {
  //     const ws = this.hyperdrive.createWriteStream(path)
  //     pump(stream, ws)
  //     ws.on('finish', () => resolve(true))
  //     ws.on('error', (err) => reject(err))
  //   })
  // }

  // Copy event bus.
  this.emit = (ev) => this.hyperdrive.emit(ev)
  this.on = (ev, cb) => this.hyperdrive.on(ev, cb)

  // Copy static props.
  const props = ['key', 'discoveryKey', 'db']
  props.forEach(key => {
    self[key] = self.hyperdrive[key]
  })
}

