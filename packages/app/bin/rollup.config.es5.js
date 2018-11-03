"use strict"; function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }Object.defineProperty(exports, "__esModule", {value: true});var _rolluppluginsucrase = require('rollup-plugin-sucrase'); var _rolluppluginsucrase2 = _interopRequireDefault(_rolluppluginsucrase);
var _rolluppluginpostcss = require('rollup-plugin-postcss'); var _rolluppluginpostcss2 = _interopRequireDefault(_rolluppluginpostcss);
var _rolluppluginnoderesolve = require('rollup-plugin-node-resolve'); var _rolluppluginnoderesolve2 = _interopRequireDefault(_rolluppluginnoderesolve);
var _rolluppluginnodebuiltins = require('rollup-plugin-node-builtins'); var _rolluppluginnodebuiltins2 = _interopRequireDefault(_rolluppluginnodebuiltins);
var _rolluppluginnodeglobals = require('rollup-plugin-node-globals'); var _rolluppluginnodeglobals2 = _interopRequireDefault(_rolluppluginnodeglobals);
var _rollupplugincommonjs = require('rollup-plugin-commonjs'); var _rollupplugincommonjs2 = _interopRequireDefault(_rollupplugincommonjs);
var _rolluppluginreplace = require('rollup-plugin-replace'); var _rolluppluginreplace2 = _interopRequireDefault(_rolluppluginreplace);
var _rollupplugincopyglob = require('rollup-plugin-copy-glob'); var _rollupplugincopyglob2 = _interopRequireDefault(_rollupplugincopyglob);
// import visualizer from 'rollup-plugin-visualizer'

let isDev = process.env.NODE_ENV === 'development'

exports. default = {
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
  plugins: [
    // peerDepsExternal(),
    (0, _rolluppluginreplace2.default)({
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
    (0, _rolluppluginpostcss2.default)({
      extract: true
    }),
    (0, _rolluppluginsucrase2.default)({
      exclude: /node_modules/,
      transforms: ['jsx']
    }),
    (0, _rolluppluginnoderesolve2.default)({
      browser: true,
      preferBuiltins: true
    }),
    (0, _rollupplugincommonjs2.default)({
      namedExports: {
        'react': ['Children', 'Component', 'PropTypes', 'createElement'],
        'react-dom': ['render']
      },
      include: /.*/
    }),
    (0, _rolluppluginnodeglobals2.default)(),
    (0, _rolluppluginnodebuiltins2.default)(),
    // visualizer(),
    (0, _rollupplugincopyglob2.default)([
      { files: 'assets/**', dest: 'dist' }
    ], { watch: true })
  ]
}
