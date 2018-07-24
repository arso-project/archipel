var tailwindConfig = require('archipel-ui/tailwind.config.js')

module.exports = {
  plugins: [
    require('postcss-import'),
    require('tailwindcss')('../../node_modules/archipel-ui/tailwind.config.js'),
    require('autoprefixer')
  ]
}
