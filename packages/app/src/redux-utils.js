
// Redux update helpers
export function updateOrAdd (array, id, newItem) {
  let updated = false
  const newArray = array.map(item => {
    if (item.id !== newItem.id) return item
    else {
      updated = true
      return { ...item, ...newItem }
    }
  })
  if (!updated) newArray.push(newItem)
  return newArray
}

export function reduceAsyncAction (state, action) {
  const { meta, payload, error } = action
  console.log('reduce async', action, meta, meta.pending)
  if (meta && meta.pending) return { ...state, pending: true }
  if (error) return { ...state, pending: false, error: error }
  else return { ...state, pending: false, error: false, data: payload }
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

export function defaultAsyncState (defaultData) {
  return {
    pending: false,
    // loaded: false,
    error: false,
    data: defaultData
  }
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