var express = require('express');
var router = express.Router();
var authenticated = require('connect-ensure-login').ensureLoggedIn('/login');
//var mongoose = require('docooment');
var mongoose = require('mongoose');
var Room = mongoose.model('Room');
var io = require('socket.io')();


/* GET home page. */
router.get( '/', authenticated,  function(req, res, next) {
  res.render('index');
});
router.get( '/user', function(req, res) {
	res.json( { username: req.user.username});
});

router.get( '/login', function(req, res, next) {
	res.render('login');
});
router.get( '/register', function( req, res, next) {
	res.render('register');
});

router.get( '/rooms', function( req, res, next) {
	Room.find( {users: req.user.username }).exec( function(err, docs) {
		console.log('find: ' + docs);
		if (err) {
			console.log(err);
			res.send(err);
		}
		if (!docs) {
			console.log('no belonging for ' + req.user.username);
			res.send(null, false);
		}
		res.json (docs);
	});
});

router.post( '/message', function( req, res, next) {

	Room.findOne( {users: req.body['room[]']}).exec( function(err, doc) {
		var msg = {
			message: req.body.message,
			user: req.user.username,
			time: 0
		};
		console.log(msg);
		doc.messages.push(msg);
		doc.save( function(err) {
			if(err)
				console.log(err);
		});
		io.emit('new message', msg);
	});
});

io.on('connection', function (socket) {
  socket.emit('connected', { message: "U r connected." });
});

router.io = io;
module.exports = router;
