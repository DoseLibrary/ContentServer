const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  devtool: 'inline-source-map',
  target: 'node',
  externals: [nodeExternals()],
  devServer: {
    static: './dist'
  },
  optimization: {
    runtimeChunk: 'single',
  },
  module: {
    rules: [
      {
        test: /\.sql?$/i,
        type: 'asset/resource',
      },
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: [
          /node_modules/,
        ],
      }
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.sql'],
  },
  output: {
    filename: '[name].bundle.js',
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/sql',
          to: 'sql/'
        }
      ]
    })
  ]
}