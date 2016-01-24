var express = require('express');
var router = express.Router();

module.exports = function(passport){

	//log in
	router.post( '/login', passport.authenticate( 'login', {
		successRedirect: '/',
		failureRedirect: '/login',
		failureFlash: true
	}));

	//sign up
	router.post('/register', passport.authenticate( 'register', {
		successRedirect: '/login',
		failureRedirect: '/register',
		failureFlash: true
	}));

	//log out
	router.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/login');
	});
	
	/*
	router.get('/fblogin', passport.authenticate('facebook', { display: 'touch', scope : 'email' }));
	
	// handle the callback after facebook has authenticated the user
	router.get('/fblogin/callback', passport.authenticate('facebook', {
		successRedirect : '/',
		failureRedirect : '/login'
	}));
	*/
	return router;
}