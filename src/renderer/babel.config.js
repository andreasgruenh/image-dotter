module.exports = {
  plugins: [
    '@babel/proposal-object-rest-spread',
    'babel-plugin-emotion',
    '@babel/proposal-class-properties'
  ],
  presets: [
    '@babel/react',
    [
      '@babel/env',
      {
        targets: {
          chrome: '66'
        }
      }
    ]
  ]
};
