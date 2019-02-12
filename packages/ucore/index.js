const avvio = require('avvio')
const util = require('./lib/util')
const nanobus = require('nanobus')

module.exports = ucore 

function ucore (opts) {
  const ucore = {}
  const bus = nanobus()

  const app = avvio(ucore)

  ucore.plugins = []

  ucore.decorate = util.makeDecorate(ucore)

  ucore.register = (plugin, opts) => {
    ucore.plugins.push(plugin)
    ucore.use(plugin.plugin, opts)
  }

  // ucore.decorate('bus', bus)
  ucore.on = bus.on.bind(bus)
  ucore.emit = bus.emit.bind(bus)
  ucore.once = bus.once.bind(bus)

  ucore.debug = () => {}

  ucore.isReady = false

  app.on('start', () => {
    ucore.isReady = true
    bus.emit('ready')
  })

  return ucore
}
