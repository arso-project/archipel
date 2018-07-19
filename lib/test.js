var tape = require('tape')
var rpc = require('.')
var stream = require('stream')
var pump = require('pump')
var duplexify = require('duplexify')
var through = require('through2')

tape('basic api calling', function (t) {
  var api = {
    upper: (str, cb) => cb(null, str.toUpperCase())
  }

  var server = rpc(api, {name: 'server'})
  var client = rpc(null, {name: 'client'})

  server.pipe(client).pipe(server)

  client.on('remote', (remote) => {
    console.log('got remote', remote)
    remote.upper('foo', (err, res) => {
      t.equal(err, null)
      t.equal(res, 'FOO')
      t.end()
    })
  })
})

tape('bidirectional api calling', function (t) {
  var api1 = {
    upper: (str, cb) => cb(null, str.toUpperCase())
  }
  var api2 = {
    multiply: (num, num2, cb) => cb(null, num * num2)
  }

  var server = rpc(api1)
  var client = rpc(api2)

  server.pipe(client).pipe(server)

  client.on('remote', (remote) => {
    remote.upper('foo', (err, res) => {
      t.equal(err, null)
      t.equal(res, 'FOO')
    })
  })
  server.on('remote', (remote) => {
    remote.multiply(3, 4, (err, res) => {
      t.equal(err, null)
      t.equal(res, 12)
      t.end()
    })
  })
})

tape('read stream', function (t) {
  function reader (str) {
    var i = 0
    return function () {
      if (i < 3) this.push(str + i)
      else this.push(null)
      i++
    }
  }

  var api = {
    rs: (str, cb) => {
      var rs = new stream.Readable({
        objectMode: true,
        read: reader(str)
      })
      cb(null, rs)
    }
  }

  var server = rpc(api, {name: 'server'})
  var client = rpc(null, {name: 'client'})
  pump(server, client, server)

  client.on('remote', (remote) => {
    remote.rs('foo', (err, rs) => {
      t.equal(err, null)
      var i = 0
      rs.on('data', (data) => {
        t.equal(data, 'foo' + i)
        i++
      })
      rs.on('end', () => {
        t.equal(i, 3)
        t.end()
      })
    })
  })
})

tape('write stream', function (t) {
  var api = {
    ws: (str, cb) => {
      t.equal(str, 'foo', 'arg passed')
      var buffer = []
      var ws = new stream.Writable({
        objectMode: true,
        write (chunk, enc, next) {
          buffer.push(chunk)
          next()
        }
      })
      ws.on('finish', () => {
        t.deepEqual(buffer, ['bar0', 'bar1', 'bar2'], 'write is correct')
        t.end()
      })
      cb(null, ws)
    }
  }

  var server = rpc(api, {name: 'sever', log: true})
  var client = rpc(null, {name: 'client', log: true})
  pump(server, client, server)

  client.on('remote', (remote) => {
    remote.ws('foo', (err, ws) => {
      t.equal(err, null, 'check err')
      for (var i = 0; i < 3; i++) {
        ws.write('bar' + i)
      }
      ws.end()
    })
  })
})

tape('read and write back and forth', function (t) {
  t.plan(28)
  var api = {
    ws: (str, cb) => {
      var buffer = []
      var ws = new stream.Writable({
        objectMode: true,
        write (chunk, enc, next) {
          buffer.push(chunk)
          next()
        }
      })
      cb(null, ws)
      ws.on('finish', () => {
        t.deepEqual(buffer, [str + '0', str + '1', str + '2'], 'ws write is correct')
      })
    },
    rs: (str, cb) => {
      var i = 0
      var rs = new stream.Readable({
        objectMode: true,
        read () {
          if (i < 3) this.push(str + i)
          else this.push(null)
          i++
        }
      })
      cb(null, rs)
    }
  }

  var server = rpc(api, {name: 'sever'})
  var client = rpc(api, {name: 'client'})
  pump(server, client, server)

  client.on('remote', (remote) => {
    remote.ws('foo', (err, ws) => {
      t.equal(err, null, 'err is null')
      for (var i = 0; i < 3; i++) {
        ws.write('foo' + i)
      }
      ws.end()
    })
    remote.rs('abc', (err, rs) => {
      t.equal(err, null, 'err is null')
      var i = 0
      rs.on('data', (data) => {
        t.equal(data, 'abc' + i, 'read 1 is correct')
        i++
      })
      rs.on('end', () => {
        t.equal(i, 3, 'read 1 ends at right pos')
      })
    })
    remote.ws('bar', (err, ws) => {
      t.equal(err, null)
      for (var i = 0; i < 3; i++) {
        ws.write('bar' + i)
      }
      ws.end()
    })
    remote.rs('kkl', (err, rs) => {
      t.equal(err, null, 'err is null')
      var i = 0
      rs.on('data', (data) => {
        t.equal(data, 'kkl' + i, 'read 2 is correct')
        i++
      })
      rs.on('end', () => {
        t.equal(i, 3, 'read 2 ends at right pos')
      })
    })
  })
  server.on('remote', (remote) => {
    remote.ws('def', (err, ws) => {
      t.equal(err, null, 'err is null')
      for (var i = 0; i < 3; i++) {
        ws.write('def' + i)
      }
      ws.end()
    })
    remote.rs('xyz', (err, rs) => {
      t.equal(err, null)
      var i = 0
      rs.on('data', (data) => {
        t.equal(data, 'xyz' + i, 'read 3 is correct')
        i++
      })
      rs.on('end', () => {
        t.equal(i, 3, 'read 3 ends at right pos')
      })
    })
    remote.ws('jkl', (err, ws) => {
      t.equal(err, null)
      for (var i = 0; i < 3; i++) {
        ws.write('jkl' + i)
      }
      ws.end()
    })
    remote.rs('xyz', (err, rs) => {
      t.equal(err, null)
      var i = 0
      rs.on('data', (data) => {
        t.equal(data, 'xyz' + i)
        i++
      })
      rs.on('end', () => {
        t.equal(i, 3)
      })
    })
  })
})

tape.skip('duplex stream solo', function (t) {
  var i = 0
  var buf = ['precr']
  var ds = new stream.Duplex({
    read () {
      if (buf.length) this.push(buf.shift().toUpperCase())
      else setTimeout(this.read.bind(this), 100)
      // console.log(i)
      // i++
      // if (i < 2) this.push('READ THIS')
      // else this.push(null)
    },
    write (chunk) {
      console.log('ds write', chunk.toString())
      buf.push(chunk.toString())
    }
  })
  var transport1 = through()
  var transport2 = through()
  // var rs = new stream.Readable({read () {}})
  // var ws = new stream.Writable({write () {}})
  var rs = through()
  var ws = through()
  var end = duplexify(ws, rs)

  var transRec = through()
  var transSend = through()
  var trans = duplexify(transRec, transSend)

  // var end = duplexify()
  // end.setReadable(rs)
  // end.setWritable(ws)

  // var end = through()
  end.on('data', (d) => console.log('end data', d.toString()))
  // end.on('end', () => 'end closed.')
  end.write('hello from end')
  // end.write('foo')
  // pump(ds, transport, end)
  // pump(ds, transport1, end, transport2, ds)
  // pump(ws, transport1, ds, transport1, rs)

  pump(ws, trans)
  pump(trans, rs)
  pump(trans, ds)
  pump(ds, trans)

  setInterval(() => {}, 1000)
})

tape('duplex stream', function (t) {
  // t.plan(4)
  var api = (name) => ({
    echo: (prefix, cb) => {
      var reader = [1, 0]
      var s = new stream.Duplex({
        read () {
          if (reader.length) {
            this.push(prefix + reader.pop())
          } else {
            this.push(null)
          }
        },
        write (chunk, enc, next) {
          t.equal(chunk.toString(), prefix + ' there', 'write on ' + name + ' is correct')
          next()
        }
      })
      console.log(name + ' ds created')
      s.on('finish', () => {
        maybeDone(s, name + ' write finished')
      })
      cb(null, s)
    }
  })

  var client = rpc(api('client'), {name: 'client', log: false})
  var server = rpc(api('server'), {name: 'server', log: false})

  pump(client, server, client)

  client.on('remote', (api) => {
    api.echo('hi', (err, ds) => {
      t.equal(err, null, 'client init no err')
      ds.write('hi there')
      ds.end()
      var i = 0
      ds.on('data', (data) => {
        t.equal(data.toString(), 'hi' + i, 'client read correct')
        i++
      })
      ds.on('end', () => maybeDone(ds, 'client read finished'))
    })
  })
  server.on('remote', (api) => {
    api.echo('hello', (err, ds) => {
      t.equal(err, null, 'no err')
      ds.write('hello there')
      ds.end()
      var i = 0
      ds.on('data', (data) => {
        t.equal(data.toString(), 'hello' + i, 'server read correct')
        i++
      })
      ds.on('end', () => maybeDone(ds, 'server read finished'))
    })
  })

  var doneStreams = []
  function maybeDone (s, log) {
    doneStreams.push(s)
    if (doneStreams.length === 4) {
      t.end()
    }
  }
})

tape('nested callbacks', function (t) {
  var api = {
    process: function (method, prefix, onFoo, onBar) {
      function toUpper (str, cb) {
        cb(prefix + str.toUpperCase())
      }
      if (method === 'foo') onFoo(toUpper)
      if (method === 'bar') onBar(toUpper)
    }
  }

  var server = rpc(api, {name: 'server', log: true})
  var client = rpc(null, {name: 'client', log: true})
  pump(server, client, server)

  client.on('remote', (api) => {
    api.process('foo', 'test', onFoo)
    api.process('bar', 'ba', onFoo, onBar)
    function onFoo (remoteUpper) {
      remoteUpper('yeah', (res) => {
        t.equal(res, 'testYEAH')
        maybeEnd()
      })
    }
    function onBar (remoteUpper) {
      remoteUpper('boo', (res) => {
        t.equal(res, 'baBOO')
        maybeEnd()
      })
    }
  })
  var done = 0
  function maybeEnd () {
    done++
    if (done === 2) t.end()
  }
})

tape('promises', function (t) {
  var api = {
    promtest: function (str) {
      console.log('promtest on server', str)
      return new Promise((resolve, reject) => {
        if (str) resolve(str.toUpperCase())
        else reject(new Error('no foo'))
      })
    },
    promtestAsync: async function (str) {
      if (str) return str.toUpperCase()
      else throw new Error('no foo')
    }
  }

  var server = rpc(api, {promise: true, log: true})
  var client = rpc(null, {promise: true, log: true})

  pump(server, client, server)

  client.on('remote', async (api) => {
    var promise = api.promtest('foo')
    promise.then((data) => {
      t.equal(data, 'FOO', 'foo correct')
    })

    var foo = await api.promtest('yeah')
    t.equal(foo, 'YEAH', 'Yeah correct')

    var values = ['test', null]
    values.map(async (val) => {
      try {
        var bar = await api.promtestAsync(val)
        t.equal(bar, 'TEST', 'async await works')
      } catch (err) {
        t.equal(err.message, 'no foo', 'rejection works')
        t.end()
      }
    })
  })
})

// tape.only('split binary stream', function (t) {
//   var api = {
//     upper: (str, cb) => cb(null, str.toUpperCase())
//   }

//   var server = rpc(api, {name: 'server', log: true})
//   var client = rpc(null, {name: 'client', log: true})
//   var transport1 = through(split)
//   var transport2 = through(split)

//   var last = null
//   function split (chunk, encoding, next) {
//     if (last) {
//       this.push(Buffer.concat([last, chunk]))
//       next()
//     } else {
//       last = chunk
//       next()
//     }
//   }

//   pump(server, transport1, client)
//   pump(client, transport2, server)

//   client.on('remote', (remote) => {
//     console.log('got remote', remote)
//     remote.upper('foo', (err, res) => {
//       t.equal(err, null)
//       t.equal(res, 'FOO')
//       t.end()
//     })
//   })
// })
