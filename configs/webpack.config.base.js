import webpack from 'webpack'
import webpackPaths from './webpack.paths'
import path from 'path'

export default {
  stats: 'errors-only',
  externals: {
    robotjs: 'robotjs',
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            // Remove this line to enable type checking in webpack builds
            transpileOnly: true,
          },
        },
      },
    ],
  },
  output: {
    path: webpackPaths.srcPath,
    library: {
      type: 'umd',
    },
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: [webpackPaths.srcPath, 'node_modules'],
    // alias: {
    //   constants: webpackPaths.srcConstantsPath,
    //   assets: webpackPaths.srcAssetsPath,
    //   server: webpackPaths.srcServerPath,
    //   utils: webpackPaths.srcUtilsPath,
    // },
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
    }),
  ],
}
