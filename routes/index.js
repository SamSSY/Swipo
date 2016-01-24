var path = require('path');
var express = require('express');
var router = express.Router();
var db = require('../util/db');
var authenticated = require('connect-ensure-login').ensureLoggedIn('/login');
var io = require('socket.io')();

var UserSocket = require('../util/userSocket');

var online_users = {};

/* GET home page. 
router.get( '/', authenticated,  function(req, res, next) {
  res.render('index');
});*/

router.get( '/user', function (req, res) {
	res.json( { username: req.user.username});
});

router.get( '/login', function (req, res, next) {
	res.render('login');
});
router.get( '/register', function (req, res, next) {
	res.render('register');
});

io.on('connection', function (socket) {
	console.log('connect client');
	socket.emit('connection', {test: 'server test'});
	socket.on('init', function (data) {
		console.log(data);
		online_users[data] = new UserSocket(socket, data);
	});
});

router.io = io;
module.exports = router;
