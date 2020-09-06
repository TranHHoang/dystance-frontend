const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /(node_modules|\.webpack)/,
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: true
          }
        }
      },
      {
        test: /\.css$/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }]
      },
      { test: /\.node$/, loader: 'node-loader' }
    ]
  },
  plugins: [new ForkTsCheckerWebpackPlugin()],
  resolve: {
    plugins: [new TsconfigPathsPlugin()],
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css"]
  }
};
