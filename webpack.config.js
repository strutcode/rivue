const path = require('path')

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: './src/index.js',
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'vuex-alt.js',
  },
  externals: ['vue'],
}
