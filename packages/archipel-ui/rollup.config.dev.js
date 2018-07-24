import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import replace from 'rollup-plugin-replace'
import sourcemaps from 'rollup-plugin-sourcemaps'
import postcss from 'rollup-plugin-postcss'
import postcssImport from 'postcss-import'
import tailwindcss from 'tailwindcss'
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
    chokidar: true
  },
  plugins: [
    postcss({
      extract: true
    }),
    babel({
      exclude: 'node_modules/**'
    }),
    replace({ 'process.env.NODE_ENV': JSON.stringify('development') }),
    resolve({
      browser: true
    }),
    commonjs({
      include: 'node_modules/**'
    }),
    sourcemaps(),
    serve('example'),
    livereload('example/dist')
  ]
}
