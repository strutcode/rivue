module.exports = {
  presets: [
    [
      '@babel/env',
      {
        targets: {
          node: true,
        },
      }
    ],
  ],
  plugins: [
    ['@babel/proposal-decorators', { legacy: true }],
    ['@babel/proposal-class-properties', { loose: true }],
    ['module-resolver', { root: './src' }],
  ],
}
