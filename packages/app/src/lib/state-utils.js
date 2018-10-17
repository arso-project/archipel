
export function sortByProp (list, prop) {
  return list.sort((a, b) => {
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