const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
  	'demo': './src/demo.js',
  	'demo-multi': './src/demo-multi.js'
  },
  output: {
    path: path.resolve(__dirname, 'demo'),
    filename: '[name].js'
  }
};