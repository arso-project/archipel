const nodeExternals = require('webpack-node-externals')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const path = require('path')

const shared = (_, argv) => ({
  entry: path.normalize(`${__dirname}/app/index.js`),
  devtool: argv.mode === 'development' ? 'inline-source-map' : false,
  mode: argv.mode,
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.normalize(`${__dirname}/app`),
        loader: 'babel-loader',
        query: {
          presets: ['react'],
          plugins: [
            'transform-object-rest-spread'
          ]
        }
      }
    ]
  },
  plugins: [
  ]
})

const electronConfig = (_, argv) => {
  const ret = shared(_, argv)
  return Object.assign({}, ret, {
    target: 'electron-main',
    externals: [nodeExternals()],
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

const webConfig = (_, argv) => {
  const ret = shared(_, argv)
  return Object.assign({}, ret, {
    target: 'web',
    externals: {'./rpc.electron.js': 'function() {}'},
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

module.exports = [
  electronConfig,
  webConfig
]
