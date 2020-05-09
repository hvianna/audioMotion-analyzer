const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
  	'demo': './demo/src/demo.js',
  	'demo-multi': './demo/src/demo-multi.js'
  },
  output: {
    path: path.resolve(__dirname, 'demo'),
    filename: '[name].js'
  }
};