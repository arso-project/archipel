const websocket = require('websocket-stream')
const rpc = require('./rpc')
const streambus = require('./rpc/streambus')
const pump = require('pump')

const api = rpc()
const stream = websocket('ws://localhost:8080')

const transport = streambus()

pump(stream, transport.stream, stream)

api.addPeer(transport).then(peer => start(peer.api))

async function start (api) {
  let res
  // try {
    // res = await api.hyperdrive.readFile('foo', 'bar')
    // console.log('res1', res)
  // } catch (e) {
    // console.log('err1', e)
  // }

  try {
    res = await api.hyperlib.open('lib1')
    console.log('open', res)
    res = await api.hyperlib.openArchive({ type: 'hyperdrive' })
    console.log('openArchive', res)
    res = await api.hyperdrive.readFile(res.key, 'bar')
    console.log('readfile', res)
  } catch (e) {
    console.log('err1', e)
  }
}
