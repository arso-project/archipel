const p = require('path')
const fs = require('fs')
let sucrase = require('sucrase')
let transform = sucrase.transform
let es6Config = fs.readFileSync(p.join(__dirname, '..', 'rollup.config.js')).toString()
let es5config = transform(es6Config, { transforms: 'imports' })
fs.writeFileSync(p.join(__dirname, 'rollup.config.es5.js'), es5config.code)

let config = require('./rollup.config.es5')

let base = p.join(__dirname, '..')

let express = require('express')
let fallback = require('express-history-api-fallback')
let nollupDevServer = require('nollup/lib/dev-middleware')
let app = express()

app.use(nollupDevServer(app, config, {
  watch: p.join(base, 'src'),
  hot: true
}))

app.use(express.static(p.join(base, 'dist')))
// app.use(express.static('./public'))
app.use(fallback('index.html', { root: p.join(base, './dist') }))
app.listen(9001)

console.log('Listening on http://localhost:9001')
