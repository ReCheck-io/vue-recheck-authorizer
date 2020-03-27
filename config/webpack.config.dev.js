const path = require('path');
const merge = require('webpack-merge');

const baseConfig = require('./webpack.config.base');

const outputFile = 'vue-recheck-authorizer';
const globalName = 'VueRecheckAuthorizer';

module.exports = merge(baseConfig, {
  mode: 'development',
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: outputFile + '.common.js',
    library: globalName,
    libraryTarget: 'umd',
  },
  devtool: 'eval-source-map',
});
