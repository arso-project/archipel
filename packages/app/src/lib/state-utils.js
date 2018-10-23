
export function sortByProp (list, prop) {
  return list.sort((a, b) => {
    if (!a || !a[prop] || !b || !b[prop]) return 0
    if (a[prop] > b[prop]) return 1
    if (a[prop] < b[prop]) return -1
    return 0
  })
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

export function sortByProps (list, props) {
  if (!Array.isArray(list) || !list.length) return list
  return [...list].sort((a, b) => {
    return props.reduce((ret, prop) => {
      if (ret !== 0) return ret
      if (typeof prop === 'function') return prop(a, b)
      let order = 'asc'
      if (prop.indexOf(':')) {
        [prop, order] = prop.split(':')
      }
      if (a[prop] === b[prop]) return ret
      if (a[prop] > b[prop]) ret = 1
      if (a[prop] < b[prop]) ret = -1
      if (order === 'desc') ret = ret * -1
      return ret
    }, 0)
  })
}

export function propsDidChange (prev, props, list) {
  let change = false
  list.forEach(prop => {
    if (prev[prop] !== props[prop]) change = true
  })
  return change
}
