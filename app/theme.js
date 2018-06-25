import palx from 'palx'
import chroma from 'chroma-js'

// const palette = palx('#fa0')
let primary = '#fd0'
primary = '#2c1357'
const palette = palx(primary)

const flattened = Object.keys(palette)
  .reduce((a, key) => {
    const value = palette[key]
    if (Array.isArray(value)) {
      a[key] = value[6]
      value.forEach((val, i) => {
        a[key + i] = val
      })
    } else {
      a[key] = value
    }
    return a
  }, {})

// todo: flatten

export const colors = Object.assign({}, flattened, {
  black: '#000',
  white: '#fff',
  primary: primary,
  primary2: chroma(primary).darken().hex()

})
export default {
  colors,
  palette
}
