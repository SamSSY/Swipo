//sqlz mysql
var mysql = require('mysql');
var Sequelize = require('sequelize');

//var getNewsByUserId = require('./feed');

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
mongoose.connect('mongodb://davidhu34:123qweasd@ds060478.mongolab.com:60478/news1');
//mongoose.connect('mongodb://davidhu34:123qweasd@ds058508.mongolab.com:58508/news');
var mongoPost = mongoose.model('Post');
var mongoUser = mongoose.model('User');
exports = module.exports = {};

exports.get = function (fn) {
	sqlzModels.Post.findAll(	{

		where: {
			time: {
				$gt: new Date(2016,0,25) //- 7*24 * 60 * 60 * 1000
			}
		},
		limit: 10,
		order: [ ['time', 'DESC' ] ]
	}).then( function (data) {
		fn(data.dataValues);
	});
	
	/*{
		console.log(data.dataValues);
		io.emit('get', data.dataValues);
	});*/
};

exports.swipe = function ( bool_LR, data) {
	mongoUser.findOne({
		'id': data.user
	}).then( function (doc) {
		console.log(doc);
		var newdoc = doc;
		if ( bool_LR ) {
			newdoc.likes.push({
				id: data.post,
				time: new Date()
			});
		} else {
			newdoc.dislikes.push({
				id: data.post,
				time: new Date()
			});
		}
		newdoc.swiped.push(data.post);
		console.log(newdoc);
		console.log(data.user);
		mongoUser.update({
			'id': data.user
		},  newdoc).then( function(data){console.log(data)}, function(err) {console.log(err);} );
	});
}

exports.onUserConnect = function (id) {
	sqlzModels.User.findOrCreate({
		where: {
			id: id
		}
	}).then( function (data) {
		console.log( (data[1])? 'created user: ': 'user found: '+ data[0].dataValues['id'] );
		if (data[1]) {
			var UserMongo = new mongoUser();
			UserMongo.id = data[0].dataValues['id'];
			UserMongo.save(function(err) {
				if (err) {
					console.log( 'Error in Saving PostMongo: ' + err);  
					throw err;  
				}
				console.log('succesful');    
			});
		}
	}, function (err) {
		console.log('find user error: ' + err);
	});
}

exports.getByCategory = function (category, fnsql) {
	sqlzModels.Post.findAll({
		where: {
			tag: category
		},
		limit: 10,
		order: [ ['time', 'DESC' ] ]
	}).then( function (array) {
		fnsql( array.map( function (data) {
			return data.dataValues.id;
		}));
	}, function (err) {
		console.log('err getByCategory sqlz: '+ err);
	});
}
exports.getByDate = function (time) {
	sqlzModels.Post.findAll({
		where: {
			time: {
				$gt: new Date(2016,0,25) //- 7*24 * 60 * 60 * 1000
			}
		},
		limit: 10,
		order: [ ['time', 'DESC' ] ]
	}).then( function (array) {
		fnsql( array.map( function (data) {
			return data.dataValues.id;
		}));
	}, function (err) {
		console.log('err getByCategory sqlz: '+ err);
	});
}
exports.docByCategory = function (id) {
	return new Promise( function (resolve, reject) {
		mongoPost.findOne({
			'id': id
		}).then( function (doc) {
			if (doc)	
				resolve(doc);
		}, function (err) {
			console.log('err getByCategory mongo: '+ err);
		});
	});
}



/*
function point (user) {
	return new Promise( function (resolve, reject) {
		sqlzModels.TagValue.findAll{
			where: {
				id: user,
			}
		}).then( function (array) {
			array.foreach( function(el) {
				swith (el.dataValues.type) {
					case 'decay':
						break;
					case '':
						break;
					case '':
					default:
				}
			resolve
		}, function (err) {
			console.log(err);
		});
		var toReturn = {
			decay : [-100, 4.88 , 5000, 45.6, 51.3, 6.2, 72.88, -15, 9.8, 10.12, 111.3],
			likes : [30, 40, 350, 400, 550, 128, 755, 820, 90, 101, 350],
			dislikes : [5, 30, 2, 40, 55, 38, 650, 1200, 40, 22 ,150]
		}

	return toReturn;
}

function findRecent (cat, num, id) {
	var newsToReturn = [];
	cat = (cat===null)? 'NULLLLLL' : cat;
	for(var i=0;i<num;i++){
		var news = {}
		news.id = i;
		news.catergory = cat;
		newsToReturn.push(news);
	}

	return newsToReturn;
}


export.getFeed = function (user) {
	getNewsByUserId(user);
}




function mParseInt(num) {
	return (num - parseInt(num) < 0.5)? parseInt(num) : parseInt(num) + 1;
}

function getCatStringByNum (num){
	switch(num){
		case 0:
			return 'headline';
		case 1:
			return 'entertainment';
		case 2:
			return 'international';
		case 3:
			return 'sports';
		case 4:
			return 'finance';
		case 5:
			return 'supplement';
		case 6:
			return 'forum';
		case 7:
			return 'society';
		case 8:
			return 'life';
		case 9:
			return 'china';
		case 10:
			return 'local';
		default:
			return null;
	}
};

function getAmountOfNewsByUserId (user_id, newsToRecommandAmount){
	newsToRecommandAmount = (newsToRecommandAmount === null)? 6 : newsToRecommandAmount;
	// Define the coefficient here

	var timeCo = 0.6;
	var viewCo = 0.2;
	// The times we want to make timeCo more important than viewCo
	var balancingTime = 1;

	var newsAmountsToReturn = [];
	var pointBoards = db.point(user_id);
	
	if(pointBoards.decay === undefined) {
		console.error('Error while getting user point, return []');
		return [];
	}

	var totalView = 0;
	var totalLike = 0;
	for(var i=0;i<pointBoards.decay.length;i++){
		totalView += pointBoards.likes[i] + pointBoards.dislikes[i];
		totalLike += pointBoards.likes[i];
	}

	var finalPoints = [];
	var finalPointsSum = 0;
	for(var i=0;i<pointBoards.decay.length;i++){
		var timePoint = balancingTime * timeCo * pointBoards.decay[i];
		var viewPoint = (pointBoards.likes[i] + pointBoards.dislikes[i] === 0)? 0 : viewCo * totalView * pointBoards.likes[i] / ( (pointBoards.likes[i] + pointBoards.dislikes[i]) );
		var totalPoint = Number( timePoint + viewPoint );
		totalPoint = (totalPoint >= 0)? totalPoint : 0;

		finalPoints.push( totalPoint );
		finalPointsSum += totalPoint;
	}

	var finalPercent = [];
	for(var i=0; i<finalPoints.length; i++){
		finalPercent.push( Number( finalPoints[i]/finalPointsSum ));
	}

	var sortedFinalPercent = [];
	for(var i=0;i<finalPercent.length;i++){
		sortedFinalPercent.push(finalPercent[i]);
	}

	// To sort the points array from large to small, use this function
	var sortNum = function(a,b){
		return b-a;
	}
	sortedFinalPercent.sort(sortNum);

	var selectedCatPercent = [];
	var selectedCatPercentSum = 0;
	var stopAmount = Math.min(sortedFinalPercent.length, newsToRecommandAmount);
	for(var i=0;i<stopAmount;i++){
		var catergory = getCatStringByNum( finalPercent.indexOf(sortedFinalPercent[i]) );
		if(catergory !== null){
			var tempNewsPercentObject = {};
			tempNewsPercentObject.cat = catergory;
			tempNewsPercentObject.percent = sortedFinalPercent[i];

			selectedCatPercent.push(tempNewsPercentObject);
			selectedCatPercentSum += sortedFinalPercent[i];
		}
	}

	var newsAmountSum = 0;
	for(var i=0;i<selectedCatPercent.length;i++){
		var tempNewsAmountObject = {};
		var tempAmountToCheck = mParseInt(newsToRecommandAmount * selectedCatPercent[i].percent / selectedCatPercentSum);
		if(tempAmountToCheck !== 0){
			tempNewsAmountObject.cat = selectedCatPercent[i].cat;
			tempNewsAmountObject.amount = tempAmountToCheck;

			newsAmountsToReturn.push(tempNewsAmountObject);
			newsAmountSum += tempNewsAmountObject.amount;
		}
	}
	
	while(newsAmountSum < newsToRecommandAmount){
		newsAmountsToReturn[0].amount++;
		newsAmountSum++;
	}

	while(newsAmountSum > newsToRecommandAmount){
		newsAmountsToReturn[newsAmountsToReturn.length -1 ].amount --;
		newsAmountSum--;
		if(newsAmountsToReturn[newsAmountsToReturn.length -1 ].amount === 0)
			newsAmountsToReturn.pop();
	}
	
	return newsAmountsToReturn;
};

// Core Function
function getNewsByUserId (user_id) {
	//define the numbers here
	var newsToGetAmount = 10;
	var newsToRecommandAmount = 6;
	var newsObjectsToReturn = [];

	var recommandCatAmounts = getAmountOfNewsByUserId(user_id,newsToRecommandAmount);
	if(recommandCatAmounts === undefined){
		console.error('Errors occur while generating recommand news amount!');
		return [];
	}

	for(var i=0;i<recommandCatAmounts.length;i++){
		var catToRequest = recommandCatAmounts[i].cat;
		var amountToRequest = recommandCatAmounts[i].amount;

		var tempNewsGot = db.findRecent(catToRequest,amountToRequest);
		for(var j=0;j<tempNewsGot.length;j++){
			newsObjectsToReturn.push(tempNewsGot[j]);
		}
	}

	var alreadyExistId = [];
	for(var i=0;i<newsObjectsToReturn.length;i++){
		alreadyExistId.push(newsObjectsToReturn[i].id);
	}

	var randomNews = db.findRecent(null, newsToGetAmount - newsObjectsToReturn.length, alreadyExistId);
	for(var i=0;i<randomNews.length;i++){
		newsObjectsToReturn.push(randomNews[i]);
	}

	return newsObjectsToReturn;
}
*/