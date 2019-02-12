const tape = require('tape')
const makeStore = require('../store/makeStore')

const initialState = {
  counter: 0,
  nodes: []
}

const appendFirstNode = newNode => (set, { select }) => {
  set(draft => {
    let node = select.firstNode(draft)
    for (let key in newNode) {
      node[key] = newNode[key]
    }
  })
}

const fetchNode = async () => {
  return { id: 'asyncnode' }
}

const addNodeAsync = () => async set => {
  let node = await fetchNode()
  set(draft => void (draft.nodes.push(node)))
}

const actions = {
  addNode: node => (set, store) => {
    set(draft => {
      draft.nodes.push(node)
    })
  },

  appendFirstNode,
  addNodeAsync,

  increment () { this.draft.counter++ }
}

const select = {
  firstNode: state => state.nodes.length ? state.nodes[0] : null,
  lastNode: state => state.nodes.length ? state.nodes[state.nodes.length - 1] : null,
  counter: state => state.counter,
  nodes: state => state.nodes
}

const store = makeStore({ initialState, actions, select, name: 'testStore' })

tape('basics', t => {
  console.log('STATE', store.get())

  let i = 1
  const subFirst = (node) => {
    if (i === 1) t.deepEqual(node, { id: 'hello' })
    if (i === 2) t.deepEqual(node, { id: 'hello', foo: 'bazz!' })
    i++
  }

  // store.subscribe(subFirst, select.firstNode)
  store.subscribe(subFirst, store.firstNode)

  store.increment()
  store.addNode({ id: 'hello' })
  store.increment()
  store.addNode({ id: 'second' })
  store.addNodeAsync({ id: 'second' })
  store.appendFirstNode({ foo: 'bazz!' })
  // store.addNode({ id: 'world' })
  store.increment()
  console.log('STATE', store.get())

  t.equal(store.get().counter, 3)
  t.equal(i, 3)
  t.end()

  function subGlobal(state) {
    console.log('GLOBAL SUB!', state)
  }

  // t.equal(store.get().counter, 2)
  // t.equal(store.firstNode().id, 'hello')
  // t.equal(store.lastNode().id, 'world')
  // store.addNode({ id: 'moon' })
  // t.equal(store.firstNode().id, 'hello')
  // t.equal(store.lastNode().id, 'moon')
})
