const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
  	'fluid': './demo/src/fluid.js',
  	'multi': './demo/src/multi.js',
  	'overlay': './demo/src/overlay.js'
  },
  output: {
    path: path.resolve(__dirname, 'demo'),
    filename: '[name].js'
  }
};