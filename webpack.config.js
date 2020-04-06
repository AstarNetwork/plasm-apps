/* eslint-disable @typescript-eslint/no-var-requires */

const path = require("path");
const webpack = require("webpack");

const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { WebpackPluginServe } = require("webpack-plugin-serve");

const ENV = process.env.NODE_ENV || "development";
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
        test: /\.(js|ts|tsx)$/,
        exclude: /(node_modules)/,
        use: "ts-loader",
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(ENV),
        WS_URL: JSON.stringify(process.env.WS_URL),
      },
    }),
    new CopyWebpackPlugin([{ from: "public" }]),
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
        }),
  ].filter((plugin) => plugin),
  watch: !isProduction,
};
