import stream from 'stream'
import rpc from './rpc'

export function streamingTest (str, cb) {
  var rs = new stream.Readable({
    objectMode: true,
    read () {}
  })
  rpc((api) => {
    api.streaming('yeah', (err, data) => {
      if (err) return
      rs.push(data)
    })
  })
  cb(null, rs)
}

export function fooTest (str, cb) {
  rpc((api) => api.foo(str, (err, data) => cb(err, data)))
}
