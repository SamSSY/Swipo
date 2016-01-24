//sqlz mysql
var mysql = require('mysql');
var Sequelize = require('sequelize');

var sequelize = new Sequelize('acsm_3863f055e350ee9', 'bdac84d335f56e', '613f8f9a', {
	host: 'ap-cdbr-azure-east-c.cloudapp.net',
	dialect: 'mysql',
	port: 3306,
	define: {
		timestamps: false
	},
	pool: {
		maxIdleTime: 900000
	}
});
setInterval(function() {sequelize.authenticate().then(function(data) {console.log('live');}, function(errors) { console.log('dead') }) }, 60000);
var sqlzModels = require('../models/sqlz')(sequelize);

//mongodb
require('../models/mongo');
var mongoose = require('mongoose');
mongoose.connect('mongodb://davidhu34:123qweasd@ds058508.mongolab.com:58508/news');
//mongoose.connect('mongodb://davidhu34:123qweasd@ds060478.mongolab.com:60478/news1');
var mongoPost = mongoose.model('Post');

exports = module.exports = {};

exports.checkPath = function (md5) {
	sqlzModels.Post.findOne({
		where: {
			id: md5
		}
	}).then( function (data) {
		//console.log(data.dataValues);
		return (data)? true: false;
	}, function (err) {
		console.log('sqlz query err: ' + err);
		return true;
	});
	//return false if data from "path" is not yet collected
};
exports.newPostSQL = function ( md5, time, title, url, source, tag, keywords, content, images) {

	sqlzModels.Post.create({
		id: md5,
		time: time,
		title: title,
		url: url,
		source: source,
		tag: tag
	}).then( function (data) {
		console.log('SQL created');
		//console.log(data.dataValues);
		var PostMongo = new mongoPost();
		PostMongo.id = md5;
		PostMongo.keywords = keywords;
		PostMongo.content = content;
		PostMongo.images = images;
		PostMongo.save( function(err) {
			if (err) {
				console.log( 'Error in Saving PostMongo: ' + err);  
				throw err;  
			}
			console.log('succesful');    
		});
	}, function (err) {
		console.log('SQL creation err: ' + err);
	});
};

exports.updateDecay = function () {
	sqlzModels.TagValue.findAll({
		where: {
			type: 'decay'
		}
	}).then( function (array) {
		array.map( function (data) {
			for ( var  key in data.dataValues) {
				if (key !== 'id' && key !== 'type')
					data.setDataValue( key, 0.75*data.getDataValue() );	
			}
		});
	}, function (err) {
		console.log('update decay err: ' + err);
	});
}