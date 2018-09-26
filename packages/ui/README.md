# Archipel UI

UI components for [Archipel](https://github.com/archipel-somoco). Uses [React](https://reactjs.org/) and [Tailwind CSS](https://tailwindcss.com/). Bundled with [Rollup](https://rollupjs.org/).

## Usage

```
npm install archipel-ui
```

You need to have a build setup that supports loading [PostCSS](https://postcss.org/) via `import` statements from JavaScript files. This is supported by most bundler, e.g. via [postcss-loader](https://github.com/postcss/postcss-loader) for webpack or [rollup-plugin-postcss](https://github.com/egoist/rollup-plugin-postcss) for rollup. Also install and enable [postcss-import](https://github.com/postcss/postcss-import).


*app.js*
```js

import React from 'react'
import ReactDOM from 'react-dom'

import { Button } from 'archipel-ui'

// Import tailwind base styles.
import 'archipel-ui/tailwind.pcss'

var Main = () => (
  <div>
    <Button>Hello, world!</Button>
  </div>
)

ReactDOM.render(<App />, document.getElementById('app'))

```

*postcss.config.js*
```js
var tailwindConfig = require('archipel-ui/tailwind.config.js')

module.exports = {
  plugins: [
    require('postcss-import'),
    require('tailwindcss')(tailwindConfig),
    require('autoprefixer')
  ]
}


```

*With webpack*: (adapted from the example in the [postcss-loader docs](https://github.com/postcss/postcss-loader))
```js

  module: {
    rules: [
      /// ...
      {
        test: /\.(css|pcss)$/,
        include: [
          path.resolve(__dirname, 'src'),
          /node_modules\/archipel-ui/
        ],
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader',
            options: { importLoaders: 1 }
          },
          { loader: 'postcss-loader' }
        ]
      }
    ]
  },
```

*With rollup*

Install and use [rollup-plugin-postcss](https://github.com/egoist/rollup-plugin-postcss) with a `postcss.config.js` as described above. No further configuration is needed.
