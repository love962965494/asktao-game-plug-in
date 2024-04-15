import checkNodeEnv from '../scripts/check-node-env'
import { merge } from 'webpack-merge'
import baseConfig from './webpack.config.base'
import webpackPaths from './webpack.paths'
import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { spawn } from 'child_process'
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin'

const path = require('path')

// When an ESLint server is running, we can't set the NODE_ENV so we'll check if it's
// at the dev webpack config is not accidentally run in a production environment
if (process.env.NODE_ENV === 'production') {
  checkNodeEnv('development')
}

const port = process.env.PORT || 1212

export default merge(baseConfig, {
  devtool: 'inline-source-map',
  mode: 'development',
  target: ['web', 'electron-renderer'],
  entry: [
    `webpack-dev-server/client?http://localhost:${port}/dist`,
    'webpack/hot/only-dev-server',
    path.join(webpackPaths.srcRendererPath, 'index.tsx'),
  ],
  output: {
    path: webpackPaths.distRendererPath,
    filename: 'renderer.dev.js',
  },
  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: true,
              importLoaders: 1,
            },
          },
          'sass-loader',
        ],
        include: /\.module\.s?(c|a)ss$/,
      },
      {
        test: /\.s?css$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
        exclude: /\.module\.s?(c|a)ss$/,
      },
      // Fonts
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      // Images
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
    }),
    new ReactRefreshWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: path.join('index.html'),
      template: path.join(webpackPaths.srcRendererPath, 'index.ejs'),
      minify: {
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: true,
      },
    }),
  ] as any[],
  node: {
    __dirname: false,
    __filename: false,
  },
  devServer: {
    port,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        pathRewrite: { '^/api': '' },
      },
    },
    compress: true,
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    static: {
      publicPath: '/',
    },
    historyApiFallback: {
      verbose: true,
      disableDotRule: false,
    },
    onBeforeSetupMiddleware() {
      console.log('Starting Main Process...')
      spawn('npm', ['run', 'watch:main'], {
        shell: true,
        env: process.env,
        stdio: 'inherit',
      })
        .on('close', (code) => process.exit(code))
        .on('error', (spawnError) => console.error(spawnError))
    },
  },
})
