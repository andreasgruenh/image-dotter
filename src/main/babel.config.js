module.exports = {
  plugins: ['@babel/proposal-object-rest-spread', '@babel/proposal-class-properties'],
  presets: [
    [
      '@babel/env',
      {
        targets: {
          node: 'current'
        }
      }
    ]
  ]
};
