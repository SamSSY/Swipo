var path = require('path');
var express = require('express');
var webpack = require('webpack');
var config = require('./webpack.config');

var app = express();
var compiler = webpack(config);

app.use(require('webpack-dev-middleware')(compiler, {
  publicPath: config.output.publicPath,
  stats: {
    colors: true
  }
}));

app.use(require('webpack-hot-middleware')(compiler));
app.use('/dist', express.static(__dirname + '/dist'));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/policy', function (req, res) {
    console.log("privacy policy");
    res.sendFile(path.join(__dirname, 'privacy-policy.html'));
});

var io = require('socket.io')
      .listen(app.listen(5000, function(){
        console.log('HTTP on http://localhost: 5000/');
      }));

var socketArray = [];

io.sockets.on('connection', function (socket) {
  console.log("connect!");
  socketArray.push(socket);
  socket.on('init', function (userData) {
      console.log(userData);
  });
}); 
