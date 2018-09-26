const hyperpc = require('hyperpc')

const api = {
  listen: (type, cb) => {

  },
  query: (name, args) => {

  },
  mutation: (name, args, cb) => {

  }
}

// in client

const queries = {
  FS_LS: 'FS_LS'
}

api.listen('query', (result) => {

})

api.query('FS_LS', { archive: key })

api.mutate('FS_MKDIR', { archive: key, path: 'test' })

import React from 'react'

const q = {
  FS_LISTDIR: 'FS_LISTDIR'
}

queries.FS_LISTDIR =  {
  name: 'FS_LISTDIR',
  loaded: (state, args) => state.fs[args.key] && state.fs[args.key]._dirlistLoaded,
  select: (state, args) => state.fs[args.key].dirlist,
  load: (args, api) => api.query(q.FS_LISTDIR, args, { watch: true }),
  registerListener: (bus) => bus.on('FS_LISTDIR', (result) => reduce('FS_LISTDIR', result)),
  reducer: (name, data, state) => {
    if (name !== 'FS_LISTDIR') return
    state.fs[data.key]._dirlistLoaded = true
    if (data.list) state.fs[data.key].dirlist = data.list
  }
}

function withQuery (q, args) {
  return fucntion
  store.addQuery(q)
  return function (loading, error, data)
  store.query()
}

const ListDir = ({ list }) => {
  return <ul>
    {list.map(node => <li key={node.name}>{node.name}</li>)}
  </ul>
}

const DListDir = ({ key }) => (
  <Query q={FS_LISTDIR} args={{ key }}>
    {({loading, error, data: { list }}) => {
      if (loading) return <Loading />
      if (error) return <Error />
      return <ListDir list={list} />
    }}
  </Query>
)

// or, which should be the same:

// DListDir = withQuery(FS_LISTDIR, { archive })(ListDir)




const ListDirC = connect()(ListDir)


// on client, steps:

// 1. loaded: (state, args) => bool
//    true  -> 2. select
//    false -> 3. load
// 2. select: (state, args) => props
// 3. load: (args, remote) => Promise
//    set loading true
//    reject -> done with error
//    resolve -> goto 2
// 4. listen: (action, state) => state


// WORKINGS

window.rpc(async api => {
  try {
    const R = await api.rootspace()
    const spaces = await R.getWorkspaces()
    const key = spaces[1].key
    const ws = await R.getWorkspace(key)
    const archive = await ws.createArchive({title: 'foo'})
    console.log(archive)
    const fs = await archive.fs()
	  console.log(fs)
    fs.readFile('dat.json', (err, cb) => console.log('GOT FILE!', err, cb))
  } catch (e) { console.log('ERROR', e) }
})
