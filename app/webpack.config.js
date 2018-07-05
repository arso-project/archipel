// const nodeExternals = require('webpack-node-externals')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const path = require('path')

const shared = (argv) => ({
  entry: path.normalize(`${__dirname}/index.js`),
  devtool: argv.mode === 'development' ? 'inline-source-map' : false,
  mode: argv.mode,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        query: {
          presets: ['env', 'react'],
          plugins: [
            'transform-object-rest-spread',
            'transform-es2015-modules-commonjs'
          ]
        }
      }
    ]
  },
  plugins: [
  ]
})

const electronConfig = (argv) => {
  return Object.assign({}, shared(argv), {
    target: 'electron-main',
    // externals: [nodeExternals(), {'./rpc.web.js': 'function() {}'}],
    externals: [
      {'./rpc.web.js': 'function() {}'}
      // {'electron-ipc-webview-stream': "require('electron-ipc-webview-stream')"}
    ],
    node: {
      __dirname: true
    },
    output: {
      path: path.normalize(`${__dirname}/dist/electron`),
      filename: 'bundle.electron.js',
      libraryTarget: 'commonjs2'
    }
  })
}

const webConfig = (argv) => {
  return Object.assign({}, shared(argv), {
    target: 'web',
    externals: [
      {'./rpc.electron.js': 'function() {}'},
      {'./stream.electron.js': 'function() {}'},
      {'electron-ipc-webview-stream': 'require("electron-ipc-webview-stream")'}
    ],
    output: {
      path: path.normalize(`${__dirname}/dist/web`),
      filename: 'bundle.web.js',
      publicPath: '/'
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: 'assets/index.html'
      })
    ]
  })
}

module.exports = function (_, argv) {
  return [
    webConfig(argv),
    electronConfig(argv)
  ]
}
