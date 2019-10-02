const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/demo.js',
  output: {
    path: path.resolve(__dirname, 'demo'),
    filename: 'demo.js'
  }
};