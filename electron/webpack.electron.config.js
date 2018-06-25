var path = require('path')

module.exports = {
  devtool: 'eval',
  entry: path.normalize(path.join(__dirname, 'index.js')),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'index.js',
    publicPath: '/',
    libraryTarget: 'commonjs2'
  },
  // weak is required by dnode (from parent), but has to be rebuilt so it is included as a manual dep and not packed.
  externals: {'weak': 'weak'},
  resolve: {
    extensions: ['.js', '.json'],
    modules: [path.join(__dirname, '..'), 'node_modules']
  },
  plugins: [
  ],
  target: 'electron-main',
  node: {
    __dirname: false,
    __filename: false
  }
}
