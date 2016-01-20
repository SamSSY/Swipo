//sqlz mysql
var mysql = require('mysql');
var Sequelize = require('sequelize');

var sequelize = new Sequelize('acsm_3863f055e350ee9', 'bdac84d335f56e', '613f8f9a', {
	host: 'ap-cdbr-azure-east-c.cloudapp.net',
	dialect: 'mysql',
	port: 3306,
	define: {
		timestamps: false
	}
});
var sqlzModel = require('../models/sqlz')(sequelize);

//mongodb
require('../models/mongo');
var mongoose = require('mongoose');
mongoose.connect('mongodb://davidhu34:123qweasd@ds058508.mongolab.com:58508/news');

module.exports = {
	checkPath: function (path) {
		sqlzModels.Post.findOne({
			where: {
				path: path
			}
		}).then( function (data) {
			//console.log(data.dataValues);
			return (data)? true: false;
		}, function (err) {
			console.log('sqlz query err: ' + err);
			return true;
		});
		//return false if data from "path" is not yet collected
	},
	newPost: function ( time, title, path, source, tags, content, images) {
	//parameter types(Date, String, String, String, String, [String], String, [String] )
		sqlzModels.Post.create({
			time: time,
			title: title,
			path: path,
			source: source,
		}).then( function (data) {
			console.log('created');
			//console.log(data.dataValues);
			var PostMongo = new mongoose.model('User')();
			PostMongo.idx = data.dataValues.path;
			if (tags) PostMongo.tags = tags;
			if (images) PostMongo.images = images;
			PostMongo.content = content;
			PostMongo.save( function(err) {
				if (err) {
					console.log( 'Error in Saving PostMongo: ' + err);  
					throw err;  
				}
				console.log('succesful');    
			});
		}, function (err) {
			console.log('creation err: ' + err);
		});
	}
};