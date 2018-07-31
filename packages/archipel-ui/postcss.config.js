var tailwindConfig = require('./tailwind.config.js')

module.exports = {
  plugins: [
    require('postcss-import'),
    require('tailwindcss')(tailwindConfig),
    require('autoprefixer')
  ]
}
