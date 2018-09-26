import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import replace from 'rollup-plugin-replace'
import postcss from 'rollup-plugin-postcss'

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs'
  },
  plugins: [
    postcss({
      extract: true,
      minimize: true
    }),
    babel({
      exclude: 'node_modules/**'
    }),
    replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
    resolve({
      browser: true
    }),
    commonjs({
      include: 'node_modules/**'
    })
  ],
  external: ['react', 'react-dom']

}
