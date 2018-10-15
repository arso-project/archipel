const http = require('http')
const url = require('url')
const path = require('path')
const fs = require('fs')
const debug = require('debug')('server')

module.exports = {
  name: 'http-server',
  plugin
}

async function plugin (app, opts) {
  app.decorate('httpServer', server(opts))
}

function server (opts) {
  const distPath = opts.staticPath
  const server = http.createServer(handle)
  return server

  function handle (req, res) {
    const reqUrl = url.parse(req.url)
    let reqPath
    if (reqUrl.pathname === '/') reqPath = path.join(distPath, 'index.html')
    else reqPath = path.join(distPath, reqUrl.pathname)
    if (reqPath === '/') reqPath = 'index.html'
    if (fs.existsSync(reqPath)) {
      fs.readFile(reqPath, (err, data) => {
        if (err) error(500, err.message)
        else success(data)
      })
    } else {
      error(404, 'File not found.')
    }
    function error (code, msg) {
      debug('request (Error %s): %s (Message: %s) ', code, req.url, msg)
      res.writeHead(code)
      res.end(msg)
    }
    function success (data) {
      res.writeHead(200)
      res.end(data)
      debug('request (OK): %s ', req.url)
    }
  }
}
