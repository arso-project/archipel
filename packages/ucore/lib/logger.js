const debug = require('debug')('store')

module.exports = storeLogger

const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined'

function storeLogger (state, prevState, meta) {
  let update = !(state === prevState)
  const { patches, subscribers, name, store } = meta

  // todo: better CLI logging.
  if (!isBrowser) return debug('Store update: %s', name)

  let lines = []

  console.groupCollapsed('%cstore update: %s %c(%s)', style('#c0a'), store.name, 'font-weight: normal; color: #907', name)
  if (!update) lines.push('[no changes.]')
  else {
    let action = { type: name }
    if (meta.args && meta.args.length) {
      if (meta.args.length === 1 && typeof meta.args[0] === 'object' && !Array.isArray(meta.args[0])) {
        action = { ...action, ...meta.args[0] }
      }
      else {
        action = {...action, args: meta.args}
      }
    }
    console.log('%cOLD:     %o', style('#444'), prevState)
    console.log('%cNEW:     %o', style('#0000CD'), state)
    console.log('%caction:  %o', style('#222'), action)
    if (patches) {
      console.log('%cpatches: %o', style('#222'), patches)
    }
    if (subscribers) {
      console.log('called %s subscribers (%s)', subscribers.length, subscribers.map(s => s.name).join(', '))
    }
  }
  console.groupEnd()
}

function style (color) {
  return `font-weight: bold; color: ${color}`
}
