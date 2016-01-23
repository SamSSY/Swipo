// import modules
var fs = require('fs');
var md5 = require('md5');
var pythonShell = require('python-shell');
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

/*
	Summary: 
		by reading paths in the file in file <newsPathsFile>, do httpGetRequest,
		generate news object and write the result to the file 
		(change the string './news.txt' to change the dest file)

*/
exports.getAllNewsObjectByPathsArray = function(pathArray, checkFunction, uploadFunction){
	console.log('Retrieving News From Apple Daily...');

	pathArray.forEach(function(path){
		if(path.search('/appledaily/') !== -1 && !checkFunction(path)){
			helper.httpGetReturnRequestBody(newsHost,encodeURI(path)).then(
				function(data){
					var news = getNewsObject(data);

					if(news !== null){
						news.classification = getTagFromPath(path);
						news.dateTime = helper.createTimeByString(news.time.toString());
						news.id = md5(path);
						news.url = newsHost + encodeURI(path);
						
						fs.writeFile('./newsCrawler/TextRank4ZH/example/temp.txt', news.content.toString(),'utf8',function (err) {});

						// Run Python script to generate a summary
						pythonShell.run('./newsCrawler/TextRank4ZH/example/summary.py', function (err, result) {
  							if (err) console.error(err);
  							if(result !== null){
  								// Get Keywords as tags  							
  								var tabRegex = /\t/gi;
	  							var textResult = undefined;
  								var indices = [];

  								while ( (textResult = tabRegex.exec(result[1])) ) {
    								indices.push(textResult.index);
								}

								var newsTags = [];

								for(var i=0;i<indices.length;i++){
									if(i === 0)
										newsTags.push(result[1].substring(0, indices[i]));
									else
										newsTags.push(result[1].substring(indices[i-1] + 1 , indices[i]));
								}

								// Get Summurized Content
								// In AppleDaily Crawler, we get summury from the site directly
  								//news.content = result[0];

  								//db.newPost(id, time, title, url, source, classification, tags, content, images)
								//param types(string, Date, String, String, String, String, [String], String, [Object] )
								//uploadFunction(news.id.toString(), news.dateTime, news.title.toString(), news.url.toString(), '蘋果日報', news.classification, newsTags, news.content.toString(), news.image);

								console.log('T: ' + news.title);
								console.log('C: ' + news.content);
								console.log(newsTags);
								console.log('\n');
  							}
						});
					}				
				},
				function(reason){
					console.log(reason);
				}
			)
		}
	});
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


// Main
/*
=======
>>>>>>> origin/Machine
var debug = false;

if(!debug){
	console.log('Apple Daily News Crawler Running...');
	getAllNewsLinks().then(
		function(paths){
			fs.writeFile('./appleNews.txt','');
			console.log('Got ' + paths.length + ' News from Apple Daily!');
			getAllNewsObjectByPathsArray(paths);
		},
		function(reason){
			console.error(reason);
		}
	);

	setInterval(function(){
		getAllNewsLinks().then(
			function(paths){
				fs.writeFile('./appleNews.txt','');
				console.log('Got ' + paths.length + ' News from Apple Daily!');
				getAllNewsObjectByPathsArray(paths);
			},
			function(reason){
				console.error(reason);
			}
		);
	},5*60*1000);
}else{
// Tester
//
///appledaily/article/headline/20151225/36974086/applesearch/4男同事霸凌女遭辱「用黃瓜」
///appledaily/article/headline/20151226/36976321/趙藤雄免入監行賄全認罪捐2億換緩刑
///appledaily/article/headline/20151226/36970019/神正妹不修圖全靠打的遮瑕膏

	helper.httpGetReturnRequestBody(newsHost,encodeURI('/appledaily/article/sports/20160101/36986501/蘋果報馬仔NBA黃蜂vs.暴龍')).then(
		function(data){
			console.log('Got news list data from Apple Daily');
			fs.writeFile('./appleTest.txt',data);
			
					var news = getNewsObject(data);
					news.path = '/appledaily/article/headline/20160101/36966502/疲勞、濛霧、流目油、畏光你需要補腎水、養肝血！';
					news.liked = 0;
					news.disliked = 0;
					news.tag = getTagFromPath('/appledaily/article/headline/20160101/36966502/疲勞、濛霧、流目油、畏光你需要補腎水、養肝血！');
						
					fs.appendFileSync('./appleNews.txt', 'Title: ' + news.title.toString() + '\n');
					fs.appendFileSync('./appleNews.txt', 'Path: ' + news.path.toString() + '\n');
					fs.appendFileSync('./appleNews.txt', 'Time: ' + news.time.toString() + '\n');
					fs.appendFileSync('./appleNews.txt', 'Tag: ' + news.tag.toString() + '\n');					
					if(news.image.length >= 1)
						fs.appendFileSync('./appleNews.txt', 'Pics: ' + news.image[0].description.toString() + '\t' + news.image[0].url.toString() + '\n');
					fs.appendFileSync('./appleNews.txt', '\n' + news.content.toString() + '\n\n\n\n');			

		},
		function(reason){
			console.error('Apple Daily retrieving data failed: ' + reason.toString());
		}
	);
}
<<<<<<< HEAD
*/
