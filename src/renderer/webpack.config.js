const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const config = {
  entry: path.join(__dirname, 'index.js'),
  mode: 'development',
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
  plugins: [new HtmlWebpackPlugin()],
  target: 'electron-renderer',
  devServer: {
    port: 3000
  }
};

module.exports = config;
