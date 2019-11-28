module.exports = {
  mode: 'production',
  entry: {
    calendar: './calendar/index.js'
  },
  output: {
    path: __dirname,
    filename: 'calendar/build/[name].js',
    library: 'calendar',
    libraryTarget: "umd", //一般都会选择umd
  },
  module: {
    rules: [
      {
        test: /\.js/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
}
