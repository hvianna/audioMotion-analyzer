module.exports = {
  mode: 'production',
  entry: './src/audioMotion-analyzer.js',
  output: {
    filename: 'audioMotion-analyzer.min.js',
    library: 'AudioMotionAnalyzer',
    libraryTarget: 'umd',
    libraryExport: 'default'
  }
};