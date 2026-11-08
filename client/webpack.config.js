import path from 'node:path';
import { fileURLToPath } from 'node:url';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default (_env, argv) => ({
  entry: './src/main.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'assets/[name].[contenthash].js',
    publicPath: '/',
    clean: true,
  },
  resolve: { extensions: ['.js', '.jsx'] },
  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      use: { loader: 'babel-loader', options: { presets: ['@babel/preset-env', ['@babel/preset-react', { runtime: 'automatic' }]] } },
    }, {
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
    }],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './index.html' }),
    new CopyPlugin({ patterns: [{ from: path.resolve(__dirname, 'public'), to: '.', globOptions: { ignore: ['**/.gitkeep'] } }] }),
    new webpack.DefinePlugin({ 'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL || 'http://localhost:5000/api') }),
  ],
  devtool: argv.mode === 'development' ? 'eval-source-map' : false,
  devServer: { historyApiFallback: true, hot: true, port: 3000, open: false },
});
