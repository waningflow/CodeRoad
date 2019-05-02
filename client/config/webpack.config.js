const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
  entry: {
    main: path.resolve(__dirname, '../src/index.js')
  },
  output: {
    path: path.resolve(__dirname, '../dist/'),
    filename: 'static/js/[name].[contenthash:8].js'
  },
  devServer: {
    contentBase: path.join(__dirname, '../dist'),
    compress: true,
    port: 3451,
    watchContentBase: true,
    progress: true
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {}
          }
        ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ['file-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/index.html'),
      favicon: path.resolve(__dirname, '../src/coderoad-icon.png'),
      meta: {
        'viewport': 'width=device-width, initial-scale=1, shrink-to-fit=no',
        'theme-color': '#000000'
      }
    }),
    new CleanWebpackPlugin()
  ]
}
