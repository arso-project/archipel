import rpc from './../api/rpc'

// Simple actions.

export const setTitle = title => ({ type: 'SET_TITLE', title })
export const uiTree = (path, props) => ({ type: 'SET_UI_TREE', path, props })

// Thunky actions.

let idx = 0
export const perftest = (type, id) => (dispatch, getState) => {
  idx++
  let run = idx
  rpc((api) => {
    console.log(`perftest ${type}-${id} run ${run}: start`)
    var t0 = performance.now()
    var i = 0
    var rs
    var buffer
    if (type === 'obj') {
      rs = api.perftest(id)
      buffer = []
    }
    if (type === 'bin') {
      rs = api.perftestBin(id)
      buffer = []
    }
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

export const query = (key, query) => (dispatch) => {
  const triples = []
  rpc((api) => api.query(key, query, (err, rs) => {
    console.log('got res', err, rs)
    if (err) return
    rs.on('data', (data) => console.log('got data', data))
    rs.on('data', (triple) => triples.push(triple))
    rs.on('end', () => dispatch({ type: 'TRIPLES_LOAD', triples: triples }))
  }))
}

export const loadArchives = (x) => (dispatch) => {
  console.log('load archives')
  rpc((api) => {
    console.log('got api')
    api.archives((err, archives) => {
      if (err) return
      console.log('got archives', archives)
      dispatch({ type: 'ARCHIVES_LOAD', archives: archives })
    })
  })
}
