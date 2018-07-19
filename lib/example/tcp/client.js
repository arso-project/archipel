var net = require('net')
var hyperpc = require('../..')

var clientApi = {
  updateState: (state) => {
    console.log('new client state', state)
  }
}

var rpc = hyperpc(clientApi, {log: true})

var client = new net.Socket()
client.connect(1337, '127.0.0.1', () => {
  rpc.pipe(client).pipe(rpc)
})

client.on('error', (err) => console.log('client socket error: ', err))

rpc.on('remote', (api) => {
  // setInterval(() => api.upper('foo', () => {}), 500)
  api.upper('foo', (err, string) => {
    if (err) return
    console.log('transformed foo: ', string.toString())
  })
  api.readValues((err, rs) => {
    // if (err) return
    if (err) console.log(err)
    rs.on('data', (data) => console.log('client readValues:', data.toString())) // prints 'read value 1', 'read value 2'
    rs.on('error', (err) => console.log('rs error', err))
    rs.on('close', () => console.log('rs close'))
    rs.on('end', () => console.log('rs end'))
  })
  // api.writeValues((err, ws) => {
  //   if (err) return
  //   ws.write('val1')
  //   ws.write('val2')
  //   ws.end()
  // })
})
