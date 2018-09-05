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
    '@babel/proposal-class-properties',
    ['module-resolver', { root: './src' }],
  ],
}
