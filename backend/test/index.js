const tape = require('tape')
const ram = require('random-access-memory')

const rpc = require('../rpc')
const localbus = require('../rpc/localbus')

const libraries = require('../lib/library')
const hyperdrive = require('../structures/hyperdrive')
const hyperdb = require('../structures/hyperdb')

const storage = name => ram()

function makeServer () {
  const hyperlib = libraries.make({ storage }, {
    hyperdrive: hyperdrive.structure,
    hyperdb: hyperdb.structure
  })
  const api = rpc({
    api: {
      hyperlib
    },
    rpc: {
      hyperdrive: hyperdrive.rpc,
      hyperlib: libraries.rpc
    }
  })
  return api
}

function makeClient () {
  return rpc()
}

async function setup () {
  const serverApi = makeServer()
  const clientApi = makeClient()
  const [clientOnServer, serverOnClient] = await localbus(serverApi, clientApi)
  console.log(clientOnServer, serverOnClient)
  return serverOnClient
}


tape('basic', t => {

  start()

  async function start (peer) {
    try {
      const client = await setup()

      const { hyperlib, hyperdrive } = client.api

      let buf = Buffer.from('world')

      let res = await hyperlib.open('lib1')
      // console.log('res', res)
      let archive = await hyperlib.openArchive({ type: 'hyperdrive' })
      let key = archive.key
      // console.log('KEY', key)
      let write = await hyperdrive.writeFile(key, 'hello', Buffer.from('world'))
      let read = await hyperdrive.readFile(key, 'hello')
      t.equal(read.toString(), 'world', 'read ok')
      let stat = await hyperdrive.stat(key, 'hello')
      // console.log('DONE', { archive, write, read, stat })
      t.end()
    } catch (e) {
      console.log('err1', e)
      t.end()
    }
  }
})

