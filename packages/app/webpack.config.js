"use strict";
const path = require("path");
const fs = require('fs')
const webpack = require("webpack");

const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const LiveReloadPlugin = require('webpack-livereload-plugin')


// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());

const PATHS = {
  entry: resolveApp('./render.js'),
  output: resolveApp('./dist'),
  copy: [{ from: resolveApp('assets'), to: resolveApp('dist') }],
  appSrc: [resolveApp('.'), resolveApp('..')]
}

const isDev = process.env.NODE_ENV === 'development'

// inspired from:
// https://github.com/alangpierce/sucrase/blob/master/website/config/webpack.config.dev.js

// This is the development configuration.
// It is focused on developer experience and fast rebuilds.
// The production configuration is different and lives in a separate file.

const config = {
  mode: isDev ? 'development' : 'production',
  // We care about seeing the compiled output, and Sucrase makes it pretty
  // readable anyway.
  // devtool: "eval",
  // This is with line numbers.
  devtool: isDev ? 'cheap-eval-source-map' : false,
  entry: [
    PATHS.entry
  ],
  output: {
    // Next line is not used in dev but WebpackDevServer crashes without it:
    path: PATHS.output,
    // Add /* filename */ comments to generated require()s in the output.
    pathinfo: isDev,
    // This does not produce a real file. It's just the virtual path that is
    // served by WebpackDevServer in development. This is the JS bundle
    // containing code from all our entry points, and the Webpack runtime.
    filename: "bundle.js",
    // There are also additional JS chunk files if you use code splitting.
    chunkFilename: "[name].chunk.js",
    // Point sourcemap entries to original disk location (format as URL on Windows)
    devtoolModuleFilenameTemplate: (info) =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, "/"),
    globalObject: `(typeof self !== 'undefined' ? self : this)`,
  },
  resolve: {
    // We placed these paths second because we want `node_modules` to "win"
    // if there are any conflicts. This matches Node resolution mechanism.
    // https://github.com/facebookincubator/create-react-app/issues/253
    modules: ["node_modules"],
    extensions: [".js", ".mjs", ".json", ".ts", ".tsx"],
  },
  module: {
    strictExportPresence: true,
    rules: [
      // Disable require.ensure as it's not a standard language feature.
      {parser: {requireEnsure: false}},
      {
        type: "javascript/auto",
        test: /\.mjs$/,
        use: [],
      },
      {
        // "oneOf" will traverse all following loaders until one will
        // match the requirements. When no loader matches it will fall
        // back to the "file" loader at the end of the loader list.
        oneOf: [
          // Process JS with Sucrase.
          {
            test: /\.(js|jsx|mjs|json)$/,
            include: PATHS.appSrc,
            loader: require.resolve("@sucrase/webpack-loader"),
            options: {
              transforms: ["jsx"],
              production: !isDev
            },
          },
          // Process CSS.
          {
            test: /\.(css|pcss)$/,
            use: ExtractTextPlugin.extract({
              fallback: 'style-loader',
              use: [
                { loader: 'css-loader', options: { importLoaders: 1 } },
                'postcss-loader',
              ],
            }),
          },
          // "file" loader makes sure those assets get served by WebpackDevServer.
          // When you `import` an asset, you get its (virtual) filename.
          // In production, they would get copied to the `build` folder.
          // This loader doesn't use a "test" so it will catch all modules
          // that fall through the other loaders.
          //
          // {
            // // Exclude `js` files to keep "css" loader working as it injects
            // // it's runtime that would otherwise processed through "file" loader.
            // // Also exclude `html` and `json` extensions so they get processed
            // // by webpacks internal loaders.
            // exclude: [/\.js$/, /\.mjs$/, /\.html$/, /\.json$/],
            // loader: require.resolve("file-loader"),
            // options: {
              // name: "static/media/[name].[hash:8].[ext]",
            // },
          // },
        ],
      },
      // ** STOP ** Are you adding a new loader?
      // Make sure to add the new loader(s) before the "file" loader.
    ],
  },

  plugins: [
    new CopyWebpackPlugin(PATHS.copy),
    // Extract CSS to a file.
    new ExtractTextPlugin("bundle.css"),
    // Makes some environment variables available to the JS code, for example:
    // if (process.env.NODE_ENV === 'development') { ... }.
    new webpack.EnvironmentPlugin(['NODE_ENV']),
  ],

  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    dgram: "empty",
    fs: "empty",
    net: "empty",
    tls: "empty",
    child_process: "empty",
  },

  // Turn off performance hints during development because we don't do any
  // splitting or minification in interest of speed. These warnings become
  // cumbersome.
  performance: {
    hints: false,
  },
};

if (isDev) {
  config.plugins.push(
    new LiveReloadPlugin({
      appendScriptTag: true
    })
  )
}

module.exports = config

function resolveApp (relativePath) {
  return path.resolve(appDirectory, relativePath);
}

