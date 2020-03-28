import path from "path";
import webpack from "webpack";

const config: webpack.Configuration = {
  mode: "production",
  entry: "./src/index.tsx",
  devtool: "source-map",
  devServer: {
    contentBase: path.join(__dirname, "assets"),
    compress: true,
      
    port: 3080,
    watchContentBase: true,
    historyApiFallback: true
  },
  module: {
    rules: [
      {
        loader: "ts-loader",
        test: /\.tsx?$/,
        exclude: [
          /[/\\]node_modules[/\\]/,
          /[/\\]test[/\\]/
        ],
        options: {
          experimentalWatchApi: true,
          transpileOnly: true
        }
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  plugins: [],
  optimization: {},
  output: {}
};

export default config;
