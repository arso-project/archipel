const hyperdiscovery = require('hyperdiscovery')
const netspeed = require('./network-speed')
const Readable = require('stream').Readable
const sodium = require('sodium-universal')
const { hex } = require('@archipel/common/util/hyperstack')

module.exports = () => new Network()

class Network {
  constructor () {
    this.networks = {}
  }

  share (archive) {
    const key = archive.key

    const opts = { live: true }

    archive.structures.values().forEach(structure => {
      const key = hex(structure.key)
      if (this.networks[key]) return
      // todo: this is a hack
      // if (!structure.id) structure.id = randomBytes(32)
      // console.log(structure.id)

      const network = hyperdiscovery(structure.structure())

      const feeds = structure.feeds()
      const speed = netspeed(feeds)

      network.on('connection', (peer) => console.log('got peer!'))

      this.networks[structure.key] = { key, network, speed }
    })
  }

  unshare (archive) {
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

function randomBytes (n) {
  var buf = Buffer.alloc(n)
  sodium.randombytes_buf(buf)
  return buf
}

