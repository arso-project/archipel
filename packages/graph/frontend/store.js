import { fromRdfValue, getPath, getPathWithoutNs, isLiteral } from './util'

const initialState = {
  subjects: {}
}

const actions = {
  query: ({ query, archive }) => async (set, { core }) => {
    let key = archive
    let { triples } = await core.rpc.request('graph/get', { query, key })
    set(draft => { draft.subjects = triplesToThings(draft.subjects, triples) })
    let related = []
    triples.forEach(triple => {
    })
  }
  // queryStream: ({ query }) => async (set, { core }) => {
  //   console.log('STRAT')
  //   let { stream } = await core.rpc.request('graph/getStream', { query })
  //   console.log('STREAM', stream)
  //   stream.on('data', triples => set(draft => { draft.subjects = triplesToThings(draft.subjects, triples) }))
  // }
}

const typeAliases = {
  'Class': ['rdfs:Class', 'owl:Class'],
  'Property': ['owl:DatatypeProperty', 'owl:FunctionalProperty', 'owl:ObjectProperty', 'owl:SymmetricalProperty', 'rdf:Property']
}

const select = {
  all: state => state.subjects,
  byId: (state, { id }) => state.subjects[id],
  byIds: (state, { ids }) => ids.map(id => state.subjects[id]),
  byType: state => makeIndex(state.subjects, 'type', typeAliases, '__notype__'),
  schema: state => makeSchema(state.subjects)
}

function propToAlias (prop) {
  let split = prop.split(':')
  if (split && split[1]) return split[1]
  return prop
}

function init (store) {
  store.decorate('proxy', makeProxy)
  store.decorate('$', makeQ)

  function makeQ () {
    let path = []
    const q = {
      _subs: () => store.get().subjects,

      dig: (id) => {
        path.push(id)
      }
    }
    return q
  }

  const skipProps = ['__path', 'inspect', 'constructor']
  const literalNames = ['id', 'type']
  function makeProxy () {
    let proxy
    const handler = {
      has: function (target, name) {
        let obj = getPath(store.get().subjects, target.__path)
        if (typeof obj === 'object' && obj[name]) return true
        return false
      },

      get: function (target, name) {
        if (name in skipProps) {
          return target[name]
        }
        let subjects = store.get().subjects
        let path = [...target.__path, name]
        let val = getPathWithoutNs(subjects, path)

        if (Array.isArray(val) && val.length === 1) val = val[0]

        let ret = valueToReturnValue(val, name, path, subjects)
        return ret
      },

      keys (target) {
        return handler.ownKeys(target)
      },

      ownKeys (target) {
        console.log('ownKeys', target)
        let obj = getPathWithoutNs(store.get().subjects, target.__path)
        if (!obj) return []
        console.log(obj)
        let keys = Object.keys(obj)
        console.log('keys', keys)
        let ret = Object.keys(obj).map(propToAlias)
        console.log('ret', ret)
        return ret
      }
    }
    proxy = new Proxy({ __path: [] }, handler)
    return proxy

    function valueToReturnValue (val, name, path, subjects) {
      let ret
      if (isLiteral(val)) {
        ret = fromRdfValue(val)
      } else if (literalNames.indexOf(name) !== -1) {
        ret = val
      } else if (typeof val === 'object') {
        ret = new Proxy({ __path: path }, handler)
      } else if (subjects[val]) {
        ret = new Proxy({ __path: [val] }, handler)
      } else ret = val
      return ret
    }
  }
}

export default {
  initialState,
  actions,
  select,
  init
}

export function makeSchema (subjects) {
  if (!Object.keys(subjects).length) return null
  let byType = makeIndex(subjects, 'type', typeAliases, '__notype__')
  let idx = {}
  console.log(byType)

  let classes = byType.Class.map(id => subjects[id])
  let props = byType.Property.map(id => subjects[id])

  idx.childClasses = makeIndex(classes, 'rdfs:subClassOf', null, 'ROOT')
  idx.parentClasses = makeReverse(idx.childClasses)

  idx.childProps = makeIndex(props, 'rdfs:subPropertyOf', null, 'ROOT')
  idx.parentProps = makeReverse(idx.childProps)

  idx.takesProperty = makeIndex(props, 'rdfs:domain', null, 'ROOT')
  idx.takesClass = makeReverse(makeIndex(props, 'rdfs:range', null, 'ROOT'))

  return idx
}

function makeReverse (idx) {
  let ret = {}
  Object.keys(idx).forEach(key => {
    idx[key].forEach(id => {
      ret[id] = ret[id] || []
      ret[id].push(key)
    })
  })
  return ret
}

function makeIndex (subjects, prop, aliases, placeholder) {
  let index = {}
  let reverseAliases = {}
  if (aliases) {
    Object.keys(aliases).forEach(alias => {
      aliases[alias].forEach(name => { reverseAliases[name] = alias })
    })
  }
  Object.values(subjects).forEach(subject => {
    let value = subject[prop]
    if (!value && placeholder) value = placeholder
    if (reverseAliases[value]) value = reverseAliases[value]
    index[value] = index[value] || []
    index[value].push(subject.id)
  })
  return index
}

function triplesToThings (state, triples) {
  if (!triples || !triples.length) return state
  triples.forEach((triple) => {
    let { subject, predicate, object } = triple
    // object = fromRdfValue(object)

    if (state[subject] && state[subject][predicate] && state[subject][predicate].indexOf(object) !== -1) {
      return
    }

    if (!state[subject]) {
      state[subject] = { id: subject }
    }

    if (predicate === 'rdf:type') state[subject].type = object
    else if (state[subject][predicate]) state[subject][predicate].push(object)
    else state[subject][predicate] = [ object ]
  })
  return state
}
