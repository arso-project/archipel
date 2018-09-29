
const SEPERATOR = '/'

export const debug = (name) => {
  return function (msg, ...args) {
    const style1 = 'color: #777'
    const style2 = 'color: #444'
    if (window.debug) {
      console.log(`%c${name} %c, ${msg}`, style1, style2, ...args)
    }
  }
}

export function joinId (parts) {
  return parts.join(SEPERATOR)
}

export function splitIds (id, map) {

}


// import stream from 'stream'

// export const createRs = () => {
//   return new stream.Readable({
//     objectMode: true,
//     read () {}
//   })
// }

// var i = 0
// export const fillRs = (rs) => (err, data) => {
//   i++
//   if ((i % 1000) === 0) console.log('data ' + i + ' ' + performance.now())
//   if (err) return
//   rs.push(data)
// }

// export function isLiteral (value) {
//   return (typeof value === 'string' && value.charAt(0) === '"')
// }

// export function isThing (value) {
//   return !isLiteral(value)
// }

// const rdfValueMatch = /(".+")(?:\^\^(.+))?$/
// export function fromRdfValue (value) {
//   const match = value.match(rdfValueMatch)
//   if (!match) return value
//   // this could be smarter getting value type as well.
//   // return { value: match[1], type: match[2] }
//   if (match[2] === 'xsd:decimal') {
//     return parseFloat(match[1].slice(1, -1))
//   }
//   return JSON.parse(match[1])
// }

// // Object helpers.

// export function remove (obj, toRemove) {
//   return obj.reduce((acc, key) => {
//     if (toRemove.indexOf(key) !== -1) acc[key] = obj[key]
//   }, {})
// }

// // Path and tree helpers.

// export function getPropsFromTree (tree, path) {
//   let pos = tree
//   path.forEach((id) => {
//     if (pos && pos[id]) pos = pos[id]
//     else pos = false
//   })
//   return pos
// }
