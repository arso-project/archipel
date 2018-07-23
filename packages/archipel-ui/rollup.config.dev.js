import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import replace from 'rollup-plugin-replace'
import sourcemaps from 'rollup-plugin-sourcemaps'
import postcss from 'rollup-plugin-postcss'
// import postcssImport from 'postcss-import'
import postcssEasyImport from 'postcss-easy-import'
import tailwindcss from 'tailwindcss'
import registerConfigAsDependency from 'archipel-ui/node_modules/tailwindcss/lib/lib/registerConfigAsDependency';

export default {
  input: 'example/index.js',
  output: {
    file: 'example/dist/index.js',
    format: 'iife',
    sourcemap: true
  },
  watch: {
    chokidar: true,
    include: 'src/**'
  },
  plugins: [
    postcss({
      extract: true,
      plugins: [
        postcssEasyImport({extensions: ['.css', '.pcss']}),
        // postcssImport(),
        tailwindcss('./src/tailwind.js')
      ]
    }),
    babel({
      exclude: 'node_modules/**'
    }),
    replace({ 'process.env.NODE_ENV': JSON.stringify('development') }),
    resolve({
      browser: true,
      main: true
    }),
    commonjs({
      include: 'node_modules/**'
    }),
    sourcemaps()
  ]
}
