const path = require('path')

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: './src/index.js',
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'rivue.js',
    library: 'rivue',
    libraryTarget: 'umd'
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
