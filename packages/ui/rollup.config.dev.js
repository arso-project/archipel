import sucrase from 'rollup-plugin-sucrase'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import replace from 'rollup-plugin-replace'
import sourcemaps from 'rollup-plugin-sourcemaps'
import postcss from 'rollup-plugin-postcss'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'

export default {
  input: 'example/index.js',
  output: {
    file: 'example/dist/index.js',
    format: 'iife',
    sourcemap: true
  },
  watch: {
  },
  plugins: [
    postcss({
      extract: true
    }),
    sucrase({
      exclude: /node_modules/,
      transforms: ['jsx']
    }),
    replace({ 'process.env.NODE_ENV': JSON.stringify('development') }),
    resolve({
      browser: true
    }),
    commonjs({
      namedExports: {
        'react': ['Children', 'Component', 'PropTypes', 'createElement'],
        'react-dom': ['render']
      },
      include: /.*/
    }),
    sourcemaps(),
    serve('example'),
    livereload('example/dist')
  ]
}
