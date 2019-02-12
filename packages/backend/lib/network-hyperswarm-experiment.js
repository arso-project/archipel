// const guts = require('@hyperswarm/guts')
//
const network = require('@hyperswarm/network')
const hyperdb = require('hyperdb')
const ram = require('random-access-memory')
const pump = require('pump')
const M = require('hypercore-protocol/messages.js')
const protocol = require('hypercore-protocol')

const topic1 = Buffer.alloc(32, 'foobar')
const topic2 = Buffer.alloc(32, 'bazbaz')

const server = network()
const client = network()
const client2 = network()

const db1_server = hyperdb(ram)
const db2_server = hyperdb(ram)
db1_server.ready(() => db2_server.ready(step1))

function step1 () {
  console.log('step1')
  db1_server.put('hello', 'world')
  db2_server.put('hello', 'moon')
  db1_client = hyperdb(ram, db1_server.key)
  db2_client = hyperdb(ram, db2_server.key)
  db1_client.ready(() => {
    db2_client.ready(() => start())
  })

  db1_client.on('remote-update', () => console.log('db1 APPEND!'))
  db2_client.on('remote-update', () => console.log('db2 APPEND!'))
}

function start () {
  console.log('start', [db1_server, db2_server].map(db => db.discoveryKey.toString('hex')))
  server.join(db1_server.discoveryKey, {
    lookup: true,
    announce: true
  })

  // server.join(db2_server.discoveryKey, {
    // lookup: true,
    // announce: true
  // })

  server.on('connection', (socket, details) => {
    console.log('server got connection', details)

    // const proto = protocol()
    // pump(socket, proto, socket)
    // proto.on('handshake', () => {
      // console.log('handshake', proto)
    // })
    // console.log(proto)
    socket.once('data', d => {
      console.log(M.Feed)
      console.log(d.length)
      let msg = M.Feed.decode(d.slice(0, 60))
      console.log('msg', msg)
      let s1 = db1_server.replicate({ live: true })
      pump(socket, s1, socket)
    })
    // db2_server.replicate({ stream: s1 })


    // socket.once('data', (d) => {
      // let msg = M.Feed.decode(d)
      // console.log('nmsg', msg)
      // // console.log(d.toString('hex'))
    // })
  })
  startClient()
}

function startClient () {
  console.log('start client')
  client.join(db1_client.discoveryKey, {
    lookup: true,
    announce: false
  })
  client.on('connection', (socket, details) => {
    console.log('client got connection', details)
    db1_client.on('remote-update', () => console.log('remote update!'))
    const repl1 = db1_client.replicate({ live: true })
    // console.log('repl1', repl1)
    pump(repl1, socket, repl1)
  })

  // client2.join(db2_client.discoveryKey, {
    // lookup: true,
    // announce: false
  // })
  // client2.on('connection', (socket, details) => {
    // console.log('client2 got connection', details)
    // // socket.write(db2_client.discoveryKey)
    // const repl1 = db2_client.replicate()
    // pump(socket, repl1, socket)
  // })

  // client.join(topic2, {
    // lookup: true,
    // announce: false
  // })
  // client.on('connection', (socket, details) => {
    // console.log('client got connection', details)
    // socket.write('hello topic2')
  // })

  // client2.join(topic2, {
    // lookup: true,
    // announce: false
  // })
  // client2.on('connection', (socket, details) => {
    // console.log('client2 got connection', details)
    // socket.write('hello topic2')
  // })
}



// const opts = (name) => ({
  // socket (socket) {
    // console.log(name, 'socket', socket)
  // }
// })

// const server = guts({
  // socket (socket, peer) {
    // console.log('server socket', socket)
    // socket.on('data', d => {
      // console.log('server recv', d)
    // })
  // }
// })
// const client = guts(opts(2))

// const topic1 = Buffer.alloc(32, 'foobar')
// const topic2 = Buffer.alloc(32, 'bazbaz')

// server.bind(() => {
  // console.log('server bind')
  // client.bind(() => {
  // console.log('client bind')
    // server.announce(topic1).once('update', () => {
      // server.announce(topic2).once('update', () => {
        // client.lookupOne(topic2, (err, peer) => {
          // console.log('client lookup!', topic1.toString(), err, peer)
          // client.connect(peer, (err, socket) => {
            // console.log('client connect!')
            // socket.write('foo')
          // })
        // })
        // client.lookupOne(topic2, (err, peer) => {
          // console.log('client lookup!', topic1.toString(), err, peer)
        // })
      // })
    // })
  // })
// })
