const webpack = require('webpack');
module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main/index.ts',
  output: {
    publicPath: '/'
  },
  // Put your normal webpack config below here
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /(node_modules|\.webpack)/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },
  devServer: {
    historyApiFallback: true,
    hot: true,
    inline: true,
    compress: true,
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
};
