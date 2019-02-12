const websocket = require('websocket-stream')
const rpc = require('./rpc')
const streambus = require('./rpc/streambus')
const pump = require('pump')

const api = rpc()
const port = process.env.NODE_PORT || 8080
const stream = websocket('ws://localhost:' + port)

const transport = streambus()

pump(stream, transport.stream, stream)

api.addPeer(transport).then(peer => start(peer))

let lib = process.argv[2] || 'lib1'
let key = process.argv[3] || null

async function start (peer) {
  let res
  const { hyperlib, hyperdrive } = peer.api
  try {
    res = await hyperlib.open(lib)
    let archive = await hyperlib.openArchive({ type: 'hyperdrive', key })

    let list = await hyperlib.listArchives()
    console.log('list', list)
    return

    res = await readwrite(peer.api, archive)
    console.log('DONE', { archive, res })
  } catch (e) {
    console.log('err1', e)
  }
}

async function readwrite (api, archive) {
  const { hyperlib, hyperdrive } = api
  key = archive.key
  console.log('KEY', key)
  let res = await hyperlib.share(key)
  console.log('share', res)
  const stream = await hyperlib.statsStream()
  console.log('STREAM', stream)
  stream.on('data', x => console.log(x))

  try {
    let firstread = await hyperdrive.readFile(key, 'hello')
    console.log('firstread', firstread.toString())
  } catch (e) { console.log('no firstread') }
  // let write = await hyperdrive.writeFile(key, 'hello', Buffer.from('world'))
  // let read = await hyperdrive.readFile(key, 'hello')
  // let stat = await hyperdrive.stat(key, 'hello')
  // return { read, write, stat }
}
