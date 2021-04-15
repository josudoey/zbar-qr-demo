const path = require('path')
const { distPath, publicPath } = require('../expose')
const config = require('./config')
module.exports = Object.assign({}, config, {
  mode: 'development',
  devServer: {
    publicPath: path.join('/', publicPath),
    contentBase: distPath,
    contentBasePublicPath: '/'
  }
})
