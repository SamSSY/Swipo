// import modules
var fs = require('fs');
var helper = require('./httpStringHelper.js');

// const strings
var newsHost = 'www.appledaily.com.tw';
var newsListPath = '/appledaily/todayapple';

/*
	summary:
			http request response from CNA news site which contains paths.

	return: Paths(String Array)
*/
var getAllNewsLinks = function(){
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
	var contentPartTailIndex = data.indexOf('</p><hr class="clearman vanisher"');
	var contentPart = data.substring(contentPartLeadIndex,contentPartTailIndex);

	// Image Part
	var imageArray = getImagesInNewsObject(contentPart);

	// Content Part
	var contentLeader = '<p id="introid">';
	var newsContent = contentPart.substring(contentPart.indexOf(contentLeader) + contentLeader.length);
	newsContent = newsContent.replace(/<BR>/gi,'\n');

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
var getAllNewsObjectByPathsArray = function(pathArray){
	console.log('Retrieving News From Apple Daily');
	//pathArray = ['/appledaily/article/headline/20151226/36970019/神正妹不修圖全靠打的遮瑕膏'];
	pathArray.forEach(function(path){
		if(path.search('/appledaily/') !== -1){
			helper.httpGetReturnRequestBody(newsHost,path).then(
				function(data){
					var news = getNewsObject(data);
					news.path = path;
					news.liked = 0;
					news.disliked = 0;
					news.tag = getTagFromPath(path);
						
					fs.appendFileSync('./appleNews.txt', 'Title: ' + news.title.toString() + '\n');
					fs.appendFileSync('./appleNews.txt', 'Path: ' + news.path.toString() + '\n');
					fs.appendFileSync('./appleNews.txt', 'Time: ' + news.time.toString() + '\n');
					fs.appendFileSync('./appleNews.txt', 'Tag: ' + news.tag.toString() + '\n');					
					fs.appendFileSync('./appleNews.txt', 'Pics: ' + news.image[0].description.toString() + '\t' + news.image[0].url.toString() + '\n');
					fs.appendFileSync('./appleNews.txt', '\n' + news.content.toString() + '\n\n\n\n');					
				},
				function(reason){
					console.log(reason);
				}
			)
		}
	});
};

var getTagFromPath = function(path){
	var tagToReturn = [];
	if(path.indexOf('headline') !== -1) tagToReturn.push('頭條要聞');
	if(path.indexOf('entertainment') !== -1) tagToReturn.push('娛樂名人');
	if(path.indexOf('international') !== -1) tagToReturn.push('國際');
	if(path.indexOf('sports') !== -1) tagToReturn.push('體育');
	if(path.indexOf('finance') !== -1) tagToReturn.push('財經');
	if(path.indexOf('supplement') !== -1) tagToReturn.push('副刊');
	if(path.indexOf('headline') !== -1) tagToReturn.push('頭條要聞');
	if(path.indexOf('forum') !== -1) tagToReturn.push('專欄');

	return tagToReturn;
};


// Main

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


// Tester
//
///appledaily/article/headline/20151225/36974086/applesearch/4男同事霸凌女遭辱「用黃瓜」
///appledaily/article/headline/20151226/36976321/趙藤雄免入監行賄全認罪捐2億換緩刑
///appledaily/article/headline/20151226/36970019/神正妹不修圖全靠打的遮瑕膏
/*
helper.httpGetReturnRequestBody(newsHost,'/appledaily/article/headline/20151226/36970019/神正妹不修圖全靠打的遮瑕膏').then(
	function(data){
		console.log('Got news list data from Apple Daily');
		fs.writeFile('./appleTest.txt',data);
		
					var news = getNewsObject(data);
					news.path = '/appledaily/article/headline/20151226/36970019/神正妹不修圖全靠打的遮瑕膏';
					news.liked = 0;
					news.disliked = 0;
					news.tag = getTagFromPath('/appledaily/article/headline/20151226/36970019/神正妹不修圖全靠打的遮瑕膏');
						
					fs.appendFileSync('./appleNews.txt', 'Title: ' + news.title.toString() + '\n');
					fs.appendFileSync('./appleNews.txt', 'Path: ' + news.path.toString() + '\n');
					fs.appendFileSync('./appleNews.txt', 'Time: ' + news.time.toString() + '\n');
					fs.appendFileSync('./appleNews.txt', 'Tag: ' + news.tag.toString() + '\n');					
					fs.appendFileSync('./appleNews.txt', 'Pics: ' + news.image[0].description.toString() + '\t' + news.image[0].url.toString() + '\n');
					fs.appendFileSync('./appleNews.txt', '\n' + news.content.toString() + '\n\n\n\n');			

	},
	function(reason){
		console.error('Apple Daily retrieving data failed: ' + reason.toString());
	}
);
*/