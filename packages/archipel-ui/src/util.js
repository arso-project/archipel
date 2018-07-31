export function cls (props, ...classes) {
  const className = []
  if (props.s) className.push(props.s)
  if (props.className) className.push(props.className)
  className.push(classes)
  return flatten(className)

  function flatten (el) {
    if (Array.isArray(el)) return el.map(flatten).join(' ')
    else return el
  }
}

export function proplist (props, classes, exclude) {
  exclude = exclude || []
  exclude.push('children', 'className')
  const className = cls(props, classes)
  const list = Object.keys(props).reduce((list, prop) => {
    if (exclude.indexOf(prop) !== -1) list[prop] = props[prop]
    return list
  }, {})
  list.className = className
  return list
}

export function classname (props, ...classes) {
  return { className: cls(props, classes) }
}
