var tailwindConfig = require('@archipel/ui/tailwind.config.js')

module.exports = {
  plugins: [
    require('postcss-import'),
    // todo: this does not trigger rebuild in watch mode.
    require('tailwindcss')(tailwindConfig),
    require('autoprefixer')
  ]
}
