import path from 'path'
import sucrase from 'rollup-plugin-sucrase'
import commonjs from 'rollup-plugin-commonjs'
import postcss from 'rollup-plugin-postcss'

export function makeRollupConfig (opts) {
  opts = opts || {}
  const types = opts.types || ['es', 'cjs']

  const pkgPath = path.join(process.cwd(), 'package.json')
  const pkg = require(pkgPath)
  const peerDeps = [...Object.keys(pkg.peerDependencies || {})]
  const deps = [...Object.keys(pkg.dependencies || {})]

  const external = [...peerDeps, ...deps]
  const input = opts.input || 'src/index.js'

  const plugins = [
    postcss({
      minimize: true
    }),
    sucrase({
      exclude: /node_modules/,
      transforms: ['jsx']
    }),
    commonjs({
      namedExports: {
        'react': ['Children', 'Component', 'PropTypes', 'createElement', 'useState', 'useContext'],
        'react-dom': ['render']
      },
      include: /.*/
    })
  ]

  const shared = { input, external, plugins }

  function makeOutput (type) {
    const output = {
      format: type,
      preserveSymlinks: true,
      preserveModules: true,
      sourcemap: true
    }
    if (Array.isArray(input)) {
      output.dir = `dist/${type}`
    } else {
      let filename = opts.output || path.basename(input)
      output.file = `dist/${type}/${filename}`
    }
    return output
  }

  const config = []
  for (let type of types) {
    config.push({ ...shared, output: makeOutput(type) })
  }

  return config
}
