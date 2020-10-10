const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const webpack = require("webpack");

const smp = new SpeedMeasurePlugin();

module.exports = smp.wrap({
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|\.webpack)/,
        use: [
          { loader: "shebang-loader" },
          {
            loader: require.resolve("ts-loader"),
            options: {
              transpileOnly: true,
              happyPackMode: true
            }
          },
        ]
      },
      {
        test: /\.tsx?$/,
        exclude: /(node_modules|\.webpack)/,
        include: require("path").resolve(__dirname, "../src"),
        use: [
          { loader: "cache-loader" },
          {
            loader: "thread-loader",
            options: {
              // there should be 1 cpu for the fork-ts-checker-webpack-plugin
              workers: require('os').cpus().length - 1,
            }
          },
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
              happyPackMode: true
            }
          }]
      },
      {
        test: /\.css$/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }]
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg|png)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'res/'
            }
          }
        ]
      },
      { test: /\.node$/, loader: 'node-loader' }
    ]
  },
  externals: [{
    'jitsi-meet-electron-utils': 'require(\'jitsi-meet-electron-utils\')'
  }],
  plugins: [
    new ForkTsCheckerWebpackPlugin({ checkSyntacticErrors: true }),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery",
      "window.$": "jquery",
    }),
  ],
  resolve: {
    plugins: [new TsconfigPathsPlugin()],
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
    symlinks: false
  }
});
