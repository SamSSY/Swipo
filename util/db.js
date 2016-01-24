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
var sqlzModels = require('../models/sqlz')(sequelize);

//mongodb
require('../models/mongo');
var mongoose = require('mongoose');
mongoose.connect('mongodb://davidhu34:123qweasd@ds058508.mongolab.com:58508/news');
var mongoPost = mongoose.model('Post');

exports = module.exports = {};

exports.get = function () {
	//mongoPost.findOne({}, function (err, data) {
	sqlzModels.Post.findOne({}).then(function(data){
		console.log(data);
		return data;
	});
}