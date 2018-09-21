const path = require('path');

const config = {
  entry: path.join(__dirname, 'index.js'),
  output: {
    filename: 'main.js',
    path: path.join(__dirname, '../../dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            cwd: __dirname
          }
        }
      }
    ]
  },
  mode: 'development',
  target: 'electron-main'
};

module.exports = config;
