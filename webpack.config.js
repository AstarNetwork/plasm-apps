/* eslint-disable @typescript-eslint/no-var-requires */

const path = require("path");
const webpack = require("webpack");

const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { WebpackPluginServe } = require("webpack-plugin-serve");

const TARGET = process.env.TARGET;
const ENV = process.env.ENV || "production";
const isProduction = ENV === "production";
const outputPath = path.join(__dirname, "build");

module.exports = {
  mode: ENV,
  entry: "./src/index.tsx",
  output: {
    filename: "index.[hash:8].js",
    path: outputPath,
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [require.resolve("style-loader"), require.resolve("css-loader")],
      },
      {
        test: /\.(js|ts|tsx)$/,
        exclude: /(node_modules)/,
        use: "ts-loader",
      },
      {
        test: /\.md$/,
        use: [require.resolve("html-loader"), require.resolve("markdown-loader")],
      },
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        use: [
          {
            loader: require.resolve("url-loader"),
            options: {
              limit: 10000,
              name: "static/[name].[hash:8].[ext]",
              esModule: false,
            },
          },
        ],
      },
      {
        test: [/\.eot$/, /\.ttf$/, /\.svg$/, /\.woff$/, /\.woff2$/],
        use: [
          {
            loader: require.resolve("file-loader"),
            options: {
              name: "static/[name].[hash:8].[ext]",
              esModule: false,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        WS_URL: JSON.stringify(
          TARGET === "main"
            ? "wss://rpc.plasmnet.io/"
            : TARGET === "test"
            ? "wss://rpc.testnet.plasmnet.io/"
            : "ws://127.0.0.1:9944"
        ),
      },
    }),
    new CopyWebpackPlugin([{ from: "public" }]),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      inject: true,
      template: "public/index.html",
      PAGE_TITLE: "Plasm Network Portal",
    }),
    isProduction
      ? null
      : new WebpackPluginServe({
          hmr: false,
          liveReload: false,
          progress: false,
          port: 3000,
          static: outputPath,
          historyFallback: true,
        }),
  ].filter((plugin) => plugin),
  watch: !isProduction,
  devtool: "inline-source-map",
};
