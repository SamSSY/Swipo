//var mongoose = require('docooment');
//var mongoose = require('mongoose');
//var User = mongoose.model('User');
var User = require('./db').models.User;
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport){

	// Passport needs to be able to serialize and deserialize users to support persistent login sessions
	passport.serializeUser( function(user, done) {
		console.log( 'serializing user:', user.name);
		done(null, user.id);
	});

	passport.deserializeUser( function(id, done) {
		User.findById(id).then( function(data) {
			var user = data.dataValues;
			console.log( 'deserializing user:', user.name);
			done(null, user);
		});
	});

	passport.use( 'login', new LocalStrategy({
			passReqToCallback : true
		}, function(req, username, password, done) { 
			User.findOne({
				where: {
					username: username
				}
			}).then( function(data) {
				if (!data) {
					console.log('User Not Found with username '+username);
					return done(null, false);                 
				} else {
					var user = data.dataValues;
					if ( !isValidPassword(user, password) ) {
						console.log('Invalid Password');
						return done(null, false);
					} return done(null, user);
				}
			}, function(err) {
				console.log('login err:', err);
				return done(err);
			});
		}
	));
	
	passport.use( 'register', new LocalStrategy({
			passReqToCallback : true // allows us to pass back the entire request to the callback
		}, function( req, username, password, done) {
			User.findOne({
				attributes: ['name', 'password'],
				where: {
					name: username
				}
			}).then( function(data) {
				 if (data) {
					console.log( 'User already exists with username: ' + username);
					return done(null, false);
				} else {
					User.create({
						name: username,
						password: createHash(password)
					}).then( function(data) {
						console.log(data);
					}, function(err) {
						console.log('creation err', err);
					});
				}
			}, function(err) {
				console.log('register err:', err);
				return done(err);
			});
		}
	));
	
	passport.use( 'facebook', new FacebookStrategy({
		'clientID'	: '1525994261027604', // your App ID
		'clientSecret' 	: 'a5fcc52565c6aa895202abe64a519ba1', // your App Secret
		'callbackURL' 	: 'http://localhost:3000/fblogin/callback',
		profileFields: ['id', 'email', 'name_format']
	}, function (token, refreshtoken, profile, done) {
		process.nextTick( function () {
			console.log(profile);
			User.findOne({
				where: {
					fb_id: profile.id
				}
			}).then( function(data) {
				if (data) {
					return done(null, data.dataValues);
				} else {
					User.create({
						fb_id: profile.id,
						fb_name: profile.name.givenName + ' ' +profile.name.familyName,
						fb_email: profile.emails[0].value,
						fb_token: token
					}).then( function (data) {
						console.log(data);
						console.log('new FB user: ' + data);
					}, function (err) {
						console.log(data);
						console.log('new FB user err: ' + err);
					})
				}
			}, function(err) {
				console.log('fb login err:' + err);
				return done(err);
			});
		});
	}));
	
	var isValidPassword = function(user, password) {
		return bCrypt.compareSync( password, user.password);
	};
	// Generates hash using bCrypt
	var createHash = function(password) {
		return bCrypt.hashSync( password, bCrypt.genSaltSync(10), null);
	};

};