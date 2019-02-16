const hyperdiscovery = require('hyperdiscovery')
const netspeed = require('./network-speed')
const Readable = require('stream').Readable
const sodium = require('sodium-universal')
const { hex } = require('@archipel/common/util/hyperstack')
const debug = require('debug')('network')

module.exports = () => new Network()

class Network {
  constructor () {
    this.networks = {}
    this._open = this._open.bind(this)
  }

  share (archive) {
    const key = archive.key
    const self = this

    const opts = { live: true }

    archive.structures.values().forEach(structure => this._open(structure))
    archive.on('structure', this._open)
  }

  _open (structure) {
    const key = hex(structure.key)
    if (this.networks[key]) return
    let db = structure.structure()
    try {
      const network = hyperdiscovery(db)
      const feeds = structure.feeds()
      const speed = netspeed(feeds)

      network.on('connection', (peer) => console.log('got peer!'))
      network.on('error', e => {
        if (e.code === 'EADDRINUSE') return // this seams to be normal
        console.error(`Network error for ${key}`, e)
      })

      this.networks[structure.key] = { key, network, speed }
    } catch (e) {
      console.error('ERRRORRRR', key, e, structure)
    }
  }

  unshare (archive) {
    archive.removeListener('structure', this._open)
    archive.structures.values().forEach(structure => {
      const key = structure.key
      if (!this.networks[key]) return
      this.networks[key].network.once('close', () => {
        // todo: clear feeds tracking
        this.networks[key] = null
      })
      this.networks[key].network.close()
    })
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
      return Object.keys(self.networks).map(key => {
        const { network, speed } = self.networks[key]
        return {
          key,
          peers: network.connections.length,
          downSpeed: speed.downloadSpeed,
          upSpeed: speed.uploadSpeed,
          downTotal: speed.downloadTotal,
          upTotal: speed.uploadTotal
        }
      })
    }
  }
}

