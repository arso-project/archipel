import differ from 'deep-object-diff'

export const debug = (msg, ...args) => {
  const style1 = 'color: #777'
  const style2 = 'color: #444'
  // if (window.debug) {
  console.log(`%c${msg}`, style2, ...args)
  // }
}

export const debugFactory = name => (msg, ...args) => {
  const style = 'color: #777'
  msg = `%c[${name}] ${msg}`
  args = [style, ...args]
  debug(msg, ...args)
}

export function debugDiff (msg, old, now) {
  console.group(`%c${msg}`, style('#22f'))
  console.log('%cOLD:     %o', style('#444'), old)
  console.log('%cNEW:     %o', style('#0000CD'), now)
  diff(old, now)
  console.groupEnd()
}

function diff (old, now) {
  // todo: why does this not work? differ is undefined
  // const diff = differ.detailedDiff(old, now)
  // Object.keys(diff).filter(k => {
  //   if (!Object.keys(diff[k]).length) delete diff[k]
  // })
  // if (!Object.keys(diff).length) return

  // // console.groupCollapsed('%cDIFF', style('#08a'))
  // if (diff.added) {
  //   console.log('%cADDED:   %o', style('#080'), diff.added)
  // }
  // if (diff.deleted) {
  //   console.log('%cDELETED: %o', style('#800'), diff.deleted)
  // }
  // if (diff.updated) {
  //   console.log('%cUPDATED: %o', style('#059'), diff.updated)
  // }
  // console.groupEnd()
}

function style (color) {
  return `font-weight: bold; color: ${color}`
}

// function init (store) {
//   let last = {}
//   watch(store, log.bind(log))

//   function log (store) {
//     console.group('%cstore logger', style('#22f'))
//     console.log('%cOLD:     %o', style('#444'), last)
//     console.log('%cNEW:     %o', style('#0000CD'), store)
//     diff(last, store)
//     console.groupEnd()
//     last = Object.assign({}, JSON.parse(JSON.stringify(store)))
//   }
// }