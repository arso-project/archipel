import palx from 'palx'
import chroma from 'chroma-js'
import { theme } from 'rebass'

console.log(theme)

// const palette = palx('#fa0')
const primary = '#1d6f6a'
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
  primary_dark: chroma(primary).darken().hex()

})

export const fonts = {
  ...theme.fonts,
  sans: '"Inter UI", sans-serif'
}

fonts[0] = fonts.sans

export default {
  ...theme,
  colors,
  palette,
  fonts
}
