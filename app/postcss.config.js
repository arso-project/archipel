var tailwindConfig = require('archipel-ui/tailwind.config.js')

module.exports = {
  plugins: [
    require('postcss-import'),
    require('tailwindcss')(tailwindConfig),
    require('autoprefixer')
  ]
}
