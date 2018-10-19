import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import replace from 'rollup-plugin-replace'

export default {
  input: 'frontend/index.js',
  output: {
    file: 'dist/graph.frontend.js',
    format: 'umd',
    name: '@archipel/graph'
  },
  plugins: [
    peerDepsExternal(),
    babel({
      exclude: /node_modules/
    }),
    replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
    resolve({
      browser: true
    }),
    commonjs({
      include: 'node_modules/**'
    })
  ]
}
