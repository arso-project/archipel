var http = require('http')
var url = require('url')
var path = require('path')
var fs = require('fs')

var rpc = require('./rpc')

var port = 8080
var distPath = process.env.ARCHIPEL_STATIC_PATH

if (!distPath || !fs.existsSync(distPath)) {
  console.error('ARCHIPEL_STATIC_PATH enviornment variable not set.')
  process.exit(1)
}

// function csp (host) {
//   var connectSrcs = ['ws://', 'wss://'].map((h) => h + host).join(' ')
//   return `default-src 'self'; style-src 'unsafe-inline'; connect-src 'self' ${connectSrcs}`
// }

var server = http.createServer((req, res) => {
  var reqUrl = url.parse(req.url)
  console.log('Request: ' + req.url)
  var reqPath
  if (reqUrl.pathname === '/') reqPath = path.join(distPath, 'index.html')
  else reqPath = path.join(distPath, reqUrl.pathname)
  if (reqPath === '/') reqPath = 'index.html'
  if (fs.existsSync(reqPath)) {
    fs.readFile(reqPath, (err, data) => {
      if (err) error(500, err.message)
      console.log('   200 OK.')
      // res.setHeader('Content-Security-Policy', csp(req.headers.host))
      res.writeHead(200)
      res.end(data)
    })
  } else {
    error(404, 'File not found.')
  }
  function error (code, msg) {
    console.log('  ' + code + ' ' + msg)
    res.writeHead(code)
    res.end(msg)
  }
})

rpc({server: server})

server.listen(port, () => console.log('Server listening on port ' + port))

if (process.env.NODE_ENV === 'development') {
  require('opn')('http://localhost:' + port)
}
