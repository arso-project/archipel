const tape = require('tape')
const ram = require('random-access-memory')

const rpc = require('@archipel/common/rpc')
const localbus = require('@archipel/common/rpc/localbus')

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

tape('network', t => {
  
  start()

  async function start () {
    try {
      const client1 = await setup()
      const client2 = await setup()

      let hyperlib1 = client1.api.hyperlib
      let hyperlib2 = client2.api.hyperlib
      let hyperdrive1 = client1.api.hyperdrive
      let hyperdrive2 = client2.api.hyperdrive

      await hyperlib1.open('lib1')
      await hyperlib2.open('lib2')
      
      let buf = Buffer.from('world')
      let name = 'hello'
      let archive1 = await hyperlib1.openArchive({ type: 'hyperdrive' })

      await hyperdrive1.writeFile(archive1.key, name, buf)
      let read1 = await hyperdrive1.readFile(archive1.key, name)
      t.equal(read1.toString(), 'world', 'read1 ok')

      let archive2 = await hyperlib2.openArchive({ key: archive1.key, type: 'hyperdrive' })
      t.equal(archive1.key, archive2.key, 'remote archive identity ok')
      t.notEqual(archive2.key, archive2.localWriterKey, 'remote archive instance ok')

      await hyperlib1.share(archive1.key)

      let read2 = await hyperdrive2.readFile(archive2.key, name)
      console.log(read2)
      t.equal(read2.toString(), 'world', 'read2 ok')
      t.end()
    } catch (e) {
      console.log('err:', e)
      t.end()
    }
  }
})
