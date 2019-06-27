const path = require('path');

module.exports = {
  entry: './src/demo.js',
  output: {
    path: path.resolve(__dirname, 'demo'),
    filename: 'demo.js'
  }
};