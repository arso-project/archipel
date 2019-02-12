const http = require('http')

const ucore = require('..')

const rpc = require('../rpc/server')

boot ()

async function boot () {
  const server = http.createServer(handle)
  const app = ucore()

  app.register(rpc, { server })
  app.use(routes)

  try {
    await app.ready()
    server.listen(10001, () => console.log('Server listening on port 10001.'))

    // let i = 0
    // setInterval(() => {
    //   i++
    //   app.request('status', 'hi, ' + i)
    //   console.log('make request', i)
    // }, 200)

  } catch (e) {
    console.log('Startup error: ', e)
  }
}

function routes (app, opts, done) {
  app.rpc.reply('test', async (req, res) => {
    return { string: req.string.toUpperCase() + ' world!' }
  })

  let cnt = 0
  app.rpc.reply('node', async req => {
    return { node: 'node-' + cnt++ }
  })

  done()
}

const fs = require('fs')
const p = require('path')
const url = require('url')
function handle (req, res) {
  const base = p.join(__dirname, 'react')
  let { pathname } = url.parse(req.url)
  if (pathname === '/') pathname = 'index.html'
  if (fs.existsSync(p.join(base, pathname))) {
    const ret = fs.readFileSync(p.join(base, pathname))
    res.writeHead(200)
    res.end(ret)
  } else {
    res.writeHead(404)
    res.end('not found.')
  }
}
