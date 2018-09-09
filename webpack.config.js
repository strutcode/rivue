const path = require('path')
const webpack = require('webpack')

const { DefinePlugin } = webpack

const base = {
  mode: process.env.NODE_ENV || 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'lib'),
    library: 'Rivue',
    libraryTarget: 'umd',
  },
  externals: {
    vue: {
      commonjs: 'vue',
      commonjs2: 'vue',
      amd: 'vue',
      root: 'Vue'
    },
  },
  devtool: 'source-map',
}

const dev = {
  ...base,
  mode: 'development',
  plugins: [
    new DefinePlugin({
      DEVELOPMENT: true,
    }),
  ],
  output: {
    ...base.output,
    filename: 'rivue.js',
  }
}

const prod = {
  ...base,
  mode: 'production',
  plugins: [
    new DefinePlugin({
      DEVELOPMENT: false,
    }),
  ],
  output: {
    ...base.output,
    filename: 'rivue.min.js',
  }
}

module.exports = [dev, prod]
