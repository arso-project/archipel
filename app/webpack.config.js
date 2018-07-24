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
        // exclude: /(node_modules)/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'index.js'),
          /node_modules\/archipel-ui/
        ],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: [
              '@babel/plugin-proposal-object-rest-spread',
              '@babel/plugin-transform-modules-commonjs',
              '@babel/plugin-syntax-dynamic-import'
            ],
            babelrc: true
          }
        }
      },
      {
        test: /\.pcss$/,
        include: [
          path.resolve(__dirname, 'src'),
          /node_modules\/archipel-ui/
        ],
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1
            }
          },
          {
            loader: 'postcss-loader'
          }
        ]
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
      {'electron': 'function() {}'}
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
