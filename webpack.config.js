const path = require('path')
const webpack = require('webpack')

const { DefinePlugin } = webpack

const base = {
  mode: process.env.NODE_ENV || 'development',
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, 'lib'),
    library: 'Rivue',
    libraryTarget: 'umd',
    globalObject: 'typeof self !== \'undefined\' ? self : this',
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
