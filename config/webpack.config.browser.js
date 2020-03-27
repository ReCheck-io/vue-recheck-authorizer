const path = require('path');
const merge = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');

const baseConfig = require('./webpack.config.base');

const outputFile = 'vue-recheck-authorizer';
const globalName = 'VueRecheckAuthorizer';

module.exports = merge(baseConfig, {
  mode: 'production',
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: outputFile + '.browser.js',
    library: globalName,
    libraryTarget: 'umd',
  },
  externals: {},
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          ecma: 2015,
          compress: {
            warnings: false,
          },
        },
      }),
    ],
  },
});
