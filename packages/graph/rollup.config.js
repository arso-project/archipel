import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import sucrase from 'rollup-plugin-sucrase'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import replace from 'rollup-plugin-replace'
import fs from 'fs'

let pkg = JSON.parse(fs.readFileSync('./package.json'))
let external = Object.keys(pkg.dependencies || {})

export default {
  input: 'frontend/index.js',
  output: {
    file: 'dist/graph.frontend.js',
    format: 'umd',
    name: '@archipel/graph'
  },
  external,
  plugins: [
    peerDepsExternal(),
    sucrase({
      exclude: /node_modules/,
      transforms: ['jsx']
    }),
    replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
    resolve({
      browser: true
    }),
    commonjs({
      include: /.*/
    })
  ]
}
