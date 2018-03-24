'use strict';

require('dotenv').config({ path: `${__dirname}/.dev.env`});
const production = process.env.NODE_ENV === 'production';

const { DefinePlugin, EnvironmentPlugin } = require('webpack');
const HtmlPlugin = require('html-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const UgliflyPlugin = require('uglifyjs-webpack-plugin');
const ExtractPlugin = require('extract-text-webpack-plugin');

let plugins = [
  //this plugin says for our env, we are using a Node env and that in our production player, we are in a Node env
  new EnvironmentPlugin(['NODE_ENV']),
  //bundles up our CSS into one big file
  new ExtractPlugin('bundle-[hash].css'),
  //for our final rendering, our app lives in this index.html file
  new HtmlPlugin({ template: `${__dirname}/src/index.html`}),
  //allows us to use env variables in our application that we consider Webpack constants
  new DefinePlugin({ 
    __DEBUG__: JSON.stringify(!production),
  }),
]

// if we are in prodcution mode, include these two add'l plugins into the plugins array, these obfuscates and minifies code
// obfuscation: changes var names
// minification: gets rid of white space
if (production) {
  plugins = plugins.concat([ new CleanPlugin(), new UgliflyPlugin ]);
}

module.exports = {
  plugins,
  entry: `${__dirname}/src/main.js`,
  devServer: {
    historyApiFallback: true,
  },
  devtool: production ? undefined : 'cheap-module-eval-source-map',
  output: {
    path: `${__dirname}/build`,
    publicPath: process.env.CDN_URL,
    filename: 'bundle-[hash].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      }, 
      {
        test: /\.scss$/,
        loader: ExtractPlugin.extract(['css-loader', 'sass-loader']),
      }, 
      { //font loader
        test: /\.(woff | woff2 | ttf | eot | glyph | \.svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000, //tells webpack to cut up first 10k chars of a file and then pulls in the next part of the file of the next 10k chars
              name: 'font/[name].ext', //tells webpack to make font directory, pull in name of font and its related extension
            },
          },
        ],
      },
      { //image loader
        test: /\.(jpg | jpeg | gif | png | tiff | svg)$/,
        exclude: /\.glyph.svg/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 6000,
              name: 'image/[name].[ext]',
            }
          }
        ]
      },
      { //audio files loader
        test: /\.(mp3 | aac | aiff | wav | flac | m4a | mp4 | ogg)$/,
        exclude: /\.glyph.svg/,
        use: [
          {
            loader: 'file-loader',
            options: { name: 'audio/[name].[ext]'},
          },
        ],
      },
    ],
  }
}