import sucrase from 'rollup-plugin-sucrase'
import postcss from 'rollup-plugin-postcss'
import json from 'rollup-plugin-json'
import resolve from 'rollup-plugin-node-resolve'
import builtins from 'rollup-plugin-node-builtins'
import globals from 'rollup-plugin-node-globals'
import commonjs from 'rollup-plugin-commonjs'
import replace from 'rollup-plugin-replace'
import copy from 'rollup-plugin-copy-glob'
import livereload from 'rollup-plugin-livereload'
// import visualizer from 'rollup-plugin-visualizer'

let isDev = process.env.NODE_ENV === 'development'

const plugins = [
  // peerDepsExternal(),
  replace({
    delimiters: ['', ''],
    exclude: /rollup-plugin-node-builtins/,
    values: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'require(\'readable-stream/transform\')': 'require(\'stream\').Transform',
      'require("readable-stream/transform")': 'require("stream").Transform',
      'require("readable-stream")': 'require("stream")',
      'require(\'readable-stream\')': 'require(\'stream\')',
      'readable-stream': 'stream',

      // Fix bundling bug in inherits.
      'ctor.prototype = Object.create(superCtor.prototype, {': 'ctor.prototype = Object.create(superCtor ? superCtor.prototype : {}, {',
      // Fix bundling bug in avvio.
      'const cache = require.cache': 'const cache = require.cache || {}'
    }
  }),
  json(),
  postcss({
    extract: true
  }),
  sucrase({
    exclude: ['**/node_modules/**', 'node_modules/**', /node_modules/],
    transforms: ['jsx']
  }),
  resolve({
    browser: true,
    preferBuiltins: true
  }),
  commonjs({
    namedExports: {
      'react': ['Children', 'Component', 'PropTypes', 'createElement', 'Fragment'],
      'react-dom': ['render']
    },
    include: /.*/
  }),
  globals(),
  builtins(),
  // visualizer(),
  copy([
    { files: 'assets/**', dest: 'dist' }
  ], { watch: true })
]

if (isDev) {
  plugins.push(livereload())
}

export default {
  input: 'render.js',
  output: {
    file: 'dist/render.js',
    format: 'iife',
    sourcemap: isDev
  },
  external: [
    'readable-stream',
    'readable-stream/transform'
  ],
  plugins
}
