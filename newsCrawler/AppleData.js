// import modules
var fs = require('fs');
var md5 = require('md5');
var summaryHelper = require('./summary.js');
var helper = require('./httpStringHelper.js');

// const strings
var newsHost = 'www.appledaily.com.tw';
var newsListPath = '/appledaily/todayapple';

// Modulize the Crawler
var exports = module.exports = {};

/*
	summary:
			http request response from CNA news site which contains paths.

	return: Paths(String Array)
*/
exports.getAllNewsLinks = function(){
	var newsLinks = new Promise(function(resolve,reject){
		console.log('Checking news from Apple Daily...')
		helper.httpGetReturnRequestBody(newsHost,newsListPath).then(
			function(data){				
				var pathgetTokenA = data.match(/(<li><a\starget="_blank"\shref="[\/]appledaily[\/]article)(.*)("\stitle=")/g);
				for(var i = 0 ; i < pathgetTokenA.length ; i++){
					pathgetTokenA[i] = pathgetTokenA[i].substring(29,pathgetTokenA[i].length - 9);
				}
				
				var pathgetTokenB = data.match(/(<li><a\shref="[\/]appledaily[\/]article)(.*)("\stitle=")/g);
				for(var i = 0 ; i < pathgetTokenB.length ; i++){
					pathgetTokenB[i] = pathgetTokenB[i].substring(13,pathgetTokenB[i].length - 9);
				}
				
				resolve(pathgetTokenA.concat(pathgetTokenB));
			},
			function(reason){
				reject(reason);
			}
		);
	});

	return newsLinks;
};

var getNewsObject = function(data){
	//Get Title
	var titleLeader = '<title>';
	var titleTailer = '</title>';
	var title = helper.getSubString(data,titleLeader,titleTailer);
	title = title.substring(0,title.length - 7);

	// Get time
	var newsTimeLeader = '<time datetime="';
	var newsTimeTailer = '/" class="">';
	var newsTime = helper.getSubString(data,newsTimeLeader,newsTimeTailer);

	// Get Content
	var contentPartLeadIndex = data.indexOf('<div class="articulum trans"');
	var contentPartTailIndex = data.indexOf('</p><hr class="clearman');
	contentPartTailIndex = (contentPartTailIndex === -1)? data.indexOf('</p><div class="aml_like">') : contentPartTailIndex
	var contentPart = data.substring(contentPartLeadIndex,contentPartTailIndex);

	// Image Part
	var imageArray = getImagesInNewsObject(contentPart);

	// Content Part
	var contentLeader = '<p id="introid">';
	var contentLeaderIndex = contentPart.indexOf(contentLeader);
	var newsContent = '';
	if(contentLeaderIndex !== -1)
		newsContent = contentPart.substring(contentLeaderIndex + contentLeader.length);
	newsContent = newsContent.replace(/(<BR>|<div>&nbsp;<\/div>)/gi,'\n');
	newsContent = helper.deleteHyperLinkTags(newsContent);
	newsContent = decodeURIComponent(newsContent);

	if(newsContent === '' && imageArray.length === 0) return null;

	var newsToReturn = {
		title: title,
		time: newsTime,
		content: newsContent,
		image: imageArray
	}

	return newsToReturn;
};

var getImagesInNewsObject = function(data){
//<figure class="lbimg sgimg sglft"><a title="
	var arrayToReturn = [];
	var titleImageLeader = '<figure class="lbimg sgimg sglft"><a title="';
	var titleImageTailer = '</figure>';
	var leaderIndex = data.indexOf(titleImageLeader);
	var tailerIndex = data.indexOf(titleImageTailer)

	if(leaderIndex !== -1 && tailerIndex !== -1)
		var titleImageContent = data.substring(leaderIndex,tailerIndex);
	else
		return arrayToReturn;

	var descriptionLeader = '<a title="';
	var descriptionTailer = '" href="';
	var description = helper.getSubString(titleImageContent,descriptionLeader,descriptionTailer);
	description = description.replace(/<BR>/gi,'\n');

	var urlLeader = '" href="';
	var urlTailer = '"><img src="';
	var url = helper.getSubString(titleImageContent,urlLeader,urlTailer);

	var imageObjectToReturn = {
		url: url,
		description: description
	};

	arrayToReturn.push(imageObjectToReturn);

	return arrayToReturn;
};

var getTagFromPath = function(path){
	var toReturn = undefined;
	if(path.indexOf('headline') !== -1) toReturn = '頭條要聞';
	if(path.indexOf('entertainment') !== -1) toReturn = '娛樂名人';
	if(path.indexOf('international') !== -1) toReturn = '國際';
	if(path.indexOf('sports') !== -1) toReturn = '體育';
	if(path.indexOf('finance') !== -1) toReturn = '財經';
	if(path.indexOf('supplement') !== -1) toReturn = '副刊';
	if(path.indexOf('forum') !== -1) toReturn = '專欄';

	return toReturn;
};

var getSingleNewsByPath = function(path, checkFunction, uploadFunction){
	if(path.search('/appledaily/') !== -1 && !checkFunction(md5(path))){
		helper.httpGetReturnRequestBody(newsHost,encodeURI(path)).then(function(data){
			var news = getNewsObject(data);

			if(news !== null){
				news.classification = getTagFromPath(path);
				news.dateTime = helper.createTimeByString(news.time.toString());
				news.id = md5(path);
				news.url = newsHost + encodeURI(path);

				if(news.content !== null && news.content !== '' && news.image.length !== 0){
					if(news.content !== null && news.content !== ''){
						summaryHelper.submitSummary(news, '蘋果日報', uploadFunction);
					}else{
						news.newsTags = []
						//db.newPost(id, time, title, url, source, classification, tags, content, images)
						//param types(string, Date, String, String, String, String, [String], String, [Object] )
						uploadFunction(news.id.toString(), news.dateTime, news.title.toString(), news.url.toString(), '蘋果日報', news.classification, news.newsTags, news.content.toString(), news.image);
					}
				}		
			}
		},
		function(reason){
			console.log(reason);
		});
	}
};

var pathArrayRecursiveFunction = function(array, cuts, checkFunction, uploadFunction){
	var theRemained = array;
	var pathArray = theRemained.splice(theRemained.length/cuts, theRemained.length);

	pathArray.forEach(function(path){
		getSingleNewsByPath(path, checkFunction, uploadFunction);
	});

	return theRemained;
}

/*
	Summary: 
		by reading paths in the file in file <newsPathsFile>, do httpGetRequest,
		generate news object and write the result to the file 
		(change the string './news.txt' to change the dest file)

*/
exports.getAllNewsObjectByPathsArray = function(pathArray, checkFunction, uploadFunction){
	console.log('Retrieving News From Apple Daily...');
	var summaryGenerater = undefined;

	// Splice the array to prevent overloading
	if(pathArray.length >= 20){
		var pathArray1 = pathArrayRecursiveFunction(pathArray, 16, checkFunction, uploadFunction);
		var pathArray2 = pathArrayRecursiveFunction(pathArray1, 16, checkFunction, uploadFunction);
		setInterval(function(){
			pathArray1 = pathArrayRecursiveFunction(pathArray2, 16, checkFunction, uploadFunction);
		},1*60*1000);
		setInterval(function(){
			pathArray2 = pathArrayRecursiveFunction(pathArray1, 16, checkFunction, uploadFunction);
		},2*60*1000);
		setInterval(function(){
			pathArray1 = pathArrayRecursiveFunction(pathArray2, 16, checkFunction, uploadFunction);
		},3*60*1000);
		setInterval(function(){
			pathArray2 = pathArrayRecursiveFunction(pathArray1, 16, checkFunction, uploadFunction);
		},4*60*1000);
		setInterval(function(){
			pathArray1 = pathArrayRecursiveFunction(pathArray2, 16, checkFunction, uploadFunction);
		},5*60*1000);
		setInterval(function(){
			pathArray2 = pathArrayRecursiveFunction(pathArray1, 16, checkFunction, uploadFunction);
		},6*60*1000);
		setInterval(function(){
			pathArray1 = pathArrayRecursiveFunction(pathArray2, 16, checkFunction, uploadFunction);
		},7*60*1000);
		setInterval(function(){
			pathArray2 = pathArrayRecursiveFunction(pathArray1, 16, checkFunction, uploadFunction);
		},8*60*1000);
		setInterval(function(){
			pathArray1 = pathArrayRecursiveFunction(pathArray2, 16, checkFunction, uploadFunction);
		},9*60*1000);
		setInterval(function(){
			pathArray2 = pathArrayRecursiveFunction(pathArray1, 16, checkFunction, uploadFunction);
		},10*60*1000);
		setInterval(function(){
			pathArray1 = pathArrayRecursiveFunction(pathArray2, 16, checkFunction, uploadFunction);
		},11*60*1000);
		setInterval(function(){
			pathArray2 = pathArrayRecursiveFunction(pathArray1, 16, checkFunction, uploadFunction);
		},12*60*1000);
		setInterval(function(){
			pathArray1 = pathArrayRecursiveFunction(pathArray2, 16, checkFunction, uploadFunction);
		},13*60*1000);
		setInterval(function(){
			pathArray2 = pathArrayRecursiveFunction(pathArray1, 16, checkFunction, uploadFunction);
		},14*60*1000);		
	}else{
		pathArray.forEach(function(path){
			getSingleNewsByPath(path, checkFunction, uploadFunction);
		});
	}
};