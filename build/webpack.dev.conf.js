'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const path = require('path')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: config.dev.devtool,

  // these devServer options should be customized in /config/index.js
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: {
      rewrites: [
        { from: /^\/experience\.html$/, to: '/experience.html' },
        { from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html') },
      ],
    },
    hot: true,
    contentBase: false, // since we use CopyWebpackPlugin.
    compress: true,
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    open: config.dev.autoOpenBrowser,
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    publicPath: config.dev.assetsPublicPath,
    proxy: config.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: config.dev.poll,
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('../config/dev.env')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    }),
    new HtmlWebpackPlugin({
      filename: 'experience.html',
      template: 'src/pages/experience/index.html',
      inject: false
    }),
    new HtmlWebpackPlugin({
      filename: 'projects.html',
      template: 'src/pages/projects/index.html',
      inject: false
    }),
    new HtmlWebpackPlugin({
      filename: 'about.html',
      template: 'src/pages/about-me/index.html',
      inject: false
    }),
    new HtmlWebpackPlugin({
      filename: 'contact.html',
      template: 'src/pages/contact/index.html',
      inject: false
    }),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.dev.assetsSubDirectory,
        ignore: ['.*']
      },
      {
        from: path.resolve(__dirname, '../src/pages/experience'),
        to: 'pages/experience',
        ignore: ['index.html', 'downloads']
      },
      {
        from: path.resolve(__dirname, '../src/pages/experience/downloads'),
        to: 'pages/experience/downloads',
        ignore: ['desktop.ini']
      },
      {
        from: path.resolve(__dirname, '../src/pages/projects'),
        to: 'pages/projects',
        ignore: ['index.html']
      },
      {
        from: path.resolve(__dirname, '../src/pages/about-me'),
        to: 'pages/about-me',
        ignore: ['index.html']
      },
      {
        from: path.resolve(__dirname, '../src/pages/contact'),
        to: 'pages/contact',
        ignore: ['index.html']
      },
      {
        from: path.resolve(__dirname, '../favicons'),
        to: 'favicons',
        ignore: ['.*']
      },
      {
        from: path.resolve(__dirname, '../public/css'),
        to: 'css',
        ignore: ['.*']
      },
      {
        from: path.resolve(__dirname, '../public/js'),
        to: 'js',
        ignore: ['.*']
      }
    ])
  ]
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        },
        onErrors: config.dev.notifyOnErrors
        ? utils.createNotifierCallback()
        : undefined
      }))

      resolve(devWebpackConfig)
    }
  })
})
