export const combineReducers = (ducks) => {
  return function (state = {}, action) {
    const nextState = {}
    ducks.forEach(duck => {
      if (duck.namespace && duck.reducer) {
        nextState[duck.namespace] = duck.reducer(state[duck.namespace], action)
      }
    })
    return nextState
  }
  // const reducers = ducks.map(duck => duck.reducer).filter(reducer => reducer)
  // return function (state, action) {
  //   if (!state) state = {}
  //   state = reducers.reduce((state, reducer) => {
  //     state = reducer(state, action)
  //     return state
  //   }, state)
  //   return state
  // }
}

// Redux update helpers
export function updateOrAdd (array, newItem, isSame) {
  let updated = false
  if (!isSame) isSame = () => false
  const newArray = array.map(item => {
    if (!isSame(item, newItem)) return item
    else {
      updated = true
      return { ...item, ...newItem }
    }
  })
  if (!updated) newArray.push(newItem)
  return newArray
}

export function reduceAsyncAction (state, action, mergeData) {
  const { pending, payload, error } = action
  if (!mergeData) mergeData = (oldData, payload) => payload
  const started = true
  // console.log('reduce async', action, meta, meta.pending)
  if (pending) return { ...state, started, pending: true }
  if (error) return { ...state, started, pending: false, error: error }
  else return { ...state, started, pending: false, error: false, data: mergeData(state.data, payload) }
}

export function isPending (action) {
  return action.meta && action.meta.pending
}

export function isError (action) {
  return action.error
}

export function isSuccess (action) {
  return !isPending(action) && !isError(action)
}

export function hasStarted (state) {
  return !state.pending && !state.error && !state.data
}

export function defaultAsyncState (defaultData, more) {
  more = more || {}
  return {
    pending: false,
    started: false,
    error: false,
    data: defaultData,
    ...more
  }
}

export function selectFromAsyncState (state) {
  return state.data || null
}

export function modifyData (state, func) {
  const data = state.data ? func(state.data) : state.data
  return { ...state, data }
}

export function sortByProp (list, prop) {
  return list.sort((a, b) => {
    if (a[prop] > b[prop]) return 1
    if (a[prop] < b[prop]) return -1
    return 0
  })
}

// function makeReducers (state, action, reducers) {
//   Object.keys(reducers).reduce((state, key) => {
//     if (action.type === key) {
//       const newState = reducers[key](state, action)
//       return { ...state, ...newState }
//     }
//     return state
//   }, state)
// }
