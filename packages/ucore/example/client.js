const ucore = require('..')
const store = require('../store')
const rpc = require('../rpc/client')

module.exports = boot

function boot () {
  const app = ucore()

  app.register(rpc, { url: 'ws://localhost:10001' })
  app.register(store)
  app.use(counterPlugin)

  return app
}

function counterPlugin (app, opts, done) {
  const store = app.makeStore('counter', counterStore())

  app.rpc.reply('status', async req => store.addStatus(req))

  store.addStatus('init!')

  done()
}

function counterStore () {
  const initialState = {
    counter: 0,
    nodes: [],
    status: []
  }

  const increment = () => set => set((draft) => {
    draft.counter++
  })

  const loadNode = () => (set, { core }) => {
    core.rpc.request('node')
      .then(({ node }) => set(draft => void draft.nodes.push(node)))
  }

  const actions = {
    increment,
    loadNode,
    // addStatus: (status) => {
    //   this.draft.status.push(status)
    // }
    addStatus: (status) => set => set(draft => void draft.status.push(status))
  }

  const select = {
    firstNode: state => {
      return state.nodes[0]
    },
    lastNode: state => {
      return state.nodes[state.nodes.length - 1]
    },
    debouncedStatus: debounceArray(state => state.status, 10)
  }

  return { initialState, actions, select }
}

function debounceArray(fn, pagesize) {
  let size = 0
  let cache = []
  return (state) => {
    let arr = fn(state)
    if (arr.length > size + pagesize) {
      cache.push(arr.slice(size, arr.length).join(', '))
      size = arr.length
    }
    return [...cache]
  }

}
