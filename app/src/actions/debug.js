import rpc from './../api/rpc'

let idx = 0
export const perftest = (type, id) => (dispatch, getState) => {
  console.log('do perfest', type, id)
  idx++
  let run = idx
  rpc((api) => {
    console.log(`perftest ${type}-${id} run ${run}: start`)
    var t0 = performance.now()
    var i = 0
    var rs
    var buffer
    if (type === 'obj') {
      api.perftest(1, (rs) => cb(rs))
      buffer = []
    }
    if (type === 'bin') {
      api.perftestBin((rs) => cb(rs))
      buffer = []
    }
    function cb (rs) {
      console.log(arguments)
      var buflen = 0
      rs.on('data', (data) => {
        i++
        if (type === 'obj') buffer.push(data)
        if (type === 'bin') {
          buffer.push(data)
          buflen = buflen + data.length
        }
        // if (i % 1000 === 0) console.log(`perftest ${type}-${id} run ${run}: recv ${i}`)
      })
      rs.on('end', () => {
        var t1 = performance.now()
        var t = (t1 - t0) / 1000
        var len
        if (type === 'obj') len = JSON.stringify(buffer).length
        if (type === 'bin') {
          len = buflen
        }
        console.log(`perftest ${type}-${id} run ${run}: done, time ${r(t, 2)}s, len ${r(len / 1024 / 1024, 2)}M`)
        console.log(`${r(i / t, 2)} req/s, ${r((len / t) / 1024, 2)} KB/s`)
        // console.log(buffer)
      })
    }
  })

  function r (x, d) {
    var f = 10 ^ d
    return Math.round(x * f) / f
  }
}

export const perftestBin = () => (dispatch) => {
  rpc((api) => {
    var t0 = perfomance.now()
  })
}

export const foo = (str) => (dispatch) => {
  rpc((api) => api.foo(str, (err, data) => {
    if (!err) dispatch(setTitle(data))
  }))
}
