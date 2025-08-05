const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCSSExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, 'dist'),
    assetModuleFilename: 'img/[path][name][ext][query]',
    publicPath: '/',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCSSExtractPlugin.loader,
          "css-loader"
        ]
      },
      {
        test: /\.js$/,
        exclude: /node-modules/,
        loader: "babel-loader"
      },
      {
        test: /\.png$/i,
        type: 'asset/resource',
      },
    ]
  },
  plugins: [
      new HtmlWebpackPlugin({
        title: "Document",
        template: "./src/index.html",
        favicon: path.resolve(__dirname, 'src/img/icon.ico')
      }),
      new MiniCSSExtractPlugin()
    ]
}