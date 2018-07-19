# hyperpc

Asynchronous bidirectional RPC in Javascript that works over any binary stream. Supports passing both callbacks and arbitrary streams (both in object and binary mode) to the remote end. An optional promise mode allows to return promises and use the remote API with `async`/`await`.

Uses [multiplex](https://github.com/maxogden/multiplex) under the hood to float many streams through a single binary stream.

In the spirit of [dnode](https://github.com/substack/dnode), [rpc-stream](https://github.com/dominictarr/rpc-stream), [muxrpc](https://github.com/ssbc/muxrpc) and [rpc-multistream](https://github.com/biobricks/rpc-multistream).

## Installation

`npm install hyperpc`

## Usage

```js
  var hyperpc = require('hyperpc')

  var values = ['hello', 'world!']
  var api = {
    upper: (str, cb) => cb(null, str.toUpperCase()),
    readStream: (str, cb) => {
      var rs = new stream.Readable({
        objectMode: true,
        read () { this.push(values.length ? values.shift() : null)}
      })
      cb(null, rs)
    }
  }

  var server = hyperpc(api)
  var client = hyperpc()

  server.pipe(client).pipe(server)
  // usually, you'd do something like:
  // server.pipe(serverSideTransportStream).pipe(server)
  // clientTransport.pipe(client).pipe(clientTransport)

  client.on('remote', (remote) => {
    remote.upper('foo', (err, res) => {
      console.log(res) // FOO
    })

    remote.readStream('bar', (err, rs) => {
      rs.on('data', (data) => {
        console.log(data)
      })
      rs.on('end', () => console.log('read stream ended'))

      // prints:
      // hello
      // world!
      // read stream ended
    })
  })
})
```

More examples are in `test.js` and `examples/`.

## API

### `var stream = hyperpc([api], [opts])`

`api` is an object of functions. The functions can be called from the remote site. The implementing side may call any callbacks that are passed. For both the call and the callbacks you may pass streams, callbacks or errors as args. They all work transparently over the remote connection. Supported streams are readable streams, writable streams, duplex streams in both object and binary modes. If a transform stream is passed, it is assumed to be a readable stream if it does not have pipes assigned (i.e. is piped to but not piped from).

`opts` and their defaults are:

* `log: false`: Enable debug mode. Log all messages to `console.log`
* `name: null`: Set a name for this end of the connection. Only used in log mode.
* `promise: false`: Support returning promises (experimental)

### Support for promises and `async/await`

Return values are ignored, unless `{ promise: true }` is set in `opts` AND the return value is a promise. In that case, on the remote end a promise is returned as well and the resolve/reject callbacks are streamed transparently.

This allows to use `hyperpc` with `async/await`:

```js
  var api = {
    promtest: async function (str) {
      if (!str) throw new Error('no arg')
      return str.toUpperCase()
    }
  }

  var server = hyperpc(api, {promise: true})
  var client = hyperpc(null, {promise: true})

  pump(server, client, server)

  client.on('remote', async (api) => {
    var val = 'hello'
    try {
      var bar = await api.promtest(val)
      console.log(bar)
    } catch (err) {
      console.log(err.message)
    }
    // prints "HELLO", and would print "no arg" if val were false.
  })
```


### Motivation

There's many RPC-over-streams modules already. Why another one? First, I wanted to learn streams in-depth. Second, hyperpc uses [multiplex](https://github.com/maxogden/multiplex) under the hood, and supports setting up arbitrary binary streams from both ends, so it should be fast to not only exchange RPC messages, but only binary data streams. No benchmarks though, yet.

Some differences to other great modules in this space:

* [dnode](https://github.com/substack/dnode): The oldest kid on the block. Does not support streams as arguments natively though.
* [muxrpc](https://github.com/ssbc/muxrpc): The preferred streaming RPC in Scuttlebut land. Uses [pull-streams](https://github.com/pull-stream/pull-stream), which I didn't want to include. Needs a manifest, which hyperpc does not.
* [rpc-multistream](https://github.com/biobricks/rpc-multistream): Similar feature set to *hyperpc*, also uses [multiplex](https://github.com/maxogden/multiplex). hyperpc can be considered a rewrite, with additional suppport for Promises.
