const hyperdiscovery = require('hyperdiscovery')
const netspeed = require('./network-speed')
const Readable = require('stream').Readable
const { hex } = require('@archipel/common/util/hyperstack')
const { prom } = require('@archipel/common/util/async')
// const debug = require('debug')('network')

module.exports = () => new Network()

class Network {
  constructor () {
    this.networks = {}
    this._open = this._open.bind(this)
  }

  share (archive) {
    archive.structures.values().forEach(structure => this._open(structure))
    archive.on('structure', this._open)
  }

  async _open (structure) {
    const opts = { live: true }
    const key = hex(structure.key)
    if (this.networks[key]) return
    await structure.ready()
    let db = structure.structure()
    try {
      const network = hyperdiscovery(db, opts)
      const feeds = structure.feeds()
      const speed = netspeed(feeds)

      network.on('connection', (peer) => console.log('got peer!'))
      network.on('error', e => {
        if (e.code === 'EADDRINUSE') return // this seams to be normal
        console.error(`Network error for ${key}`, e)
      })

      this.networks[key] = { key, network, speed }
    } catch (e) {
      console.error('Error sharing structure', key, e)
    }
  }

  unshare (archive) {
    archive.removeListener('structure', this._open)
    archive.structures.values().forEach(structure => {
      const key = hex(structure.key)
      if (!this.networks[key]) return
      this.networks[key].network.once('close', () => {
        // todo: clear feeds tracking
        this.networks[key] = null
      })
      this.networks[key].network.close()
    })
  }

  closeAll () {
    const self = this
    let [promise, done] = prom()
    for (let network of Object.values(this.networks)) {
      network.network.once('close', finish)
      network.network.close()
    }
    let i = 0
    function finish () {
      i++
      if (i === Object.values(self.networks).length) done()
    }
    return promise
  }

  createStatsStream (interval) {
    const self = this
    interval = interval || 1000

    const stream = new Readable({
      objectMode: true,
      read () {}
    })
    setInterval(() => stream.push(current()), interval)
    return stream

    function current () {
      return Object.keys(self.networks).filter(key => self.networks[key]).map(key => {
        const { network, speed } = self.networks[key]
        return {
          key,
          peers: network.connections.length,
          downSpeed: speed.downloadSpeed,
          upSpeed: speed.uploadSpeed,
          downTotal: speed.downloadTotal,
          upTotal: speed.uploadTotal
        }
      }).reduce((acc, obj) => {
        acc[obj.key] = obj
        delete obj.key
        return acc
      }, {})
    }
  }
}
