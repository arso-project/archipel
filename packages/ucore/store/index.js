const makeStore = require('./makeStore')

module.exports = {
  name: 'store',
  plugin: store
}

async function store (core, opts) {
  const stores = {}
  core.decorate('addStore', (name, store) => {
    store.decorate('core', core)
    store.name = name
    stores[name] = store
    return store
  })

  core.decorate('getStore', name => {
    return stores[name]
  })

  core.decorate('makeStore', (name, opts) => {
    const store = makeStore({ name, ...opts })
    core.addStore(name, store)
    return store
  })
  
}
