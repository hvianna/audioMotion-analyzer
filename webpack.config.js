const path = require('path');

module.exports = {
  entry: './demo/demo-src.js',
  output: {
    path: path.resolve(__dirname, 'demo'),
    filename: 'demo.js'
  }
};