const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const fs = require('fs');

class CopySDKPlugin {
  apply(compiler) {
    compiler.plugin('emit', function (compilation, callback) {
      const sdkPath = path.resolve(__dirname, 'dist/unified-sdk.min.js');
      const sdkContent = fs.readFileSync(sdkPath);
      compilation.assets['unified-sdk.min.js'] = {
        source: function () { return sdkContent; },
        size: function () { return sdkContent.length; }
      };
      callback();
    });
  }
}

module.exports = {
  entry: './src/main.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ['awesome-typescript-loader', 'angular2-template-loader']
      },
      {
        test: /\.html$/,
        use: 'raw-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ],
    exprContextCritical: false
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new webpack.ContextReplacementPlugin(
      /angular(\\|\/)core(\\|\/)@angular/,
      path.resolve(__dirname, 'src')
    ),
    new CopySDKPlugin()
  ],
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 4200
  }
};
