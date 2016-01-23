// import modules
var fs = require('fs');
var md5 = require('md5');
var eachSeries = require('async-each-series');
var summaryHelper = require('./summary.js');
var helper = require('./httpStringHelper.js');

// const strings
var newsHost = 'www.cna.com.tw';

// Modulize the crawler
var exports = module.exports = {};

// helper function
/*
	Summary
		Get image url and description from news content
	params
		content (string): the news content which contains image
	return
		array of object {url ,description} 
*/
var getImageObjectsFromContent = function(content){
	var imageObjectArray = [];
	var urlArray = [];
	var desArray = [];
	var result = undefined;
	var urlIndicesLead = [];
	var urlIndicesTail = [];
	var desIndicesLead = [];
	var desIndicesTail = [];

	var urlRegexL = /img src="http/gi;
	while ( (result = urlRegexL.exec(content)) ) {
   		urlIndicesLead.push(result.index);
	}

	var urlRegexT = /jpg"/gi;
	while ( (result = urlRegexT.exec(content)) ) {
   		urlIndicesTail.push(result.index);
	}
	
	var desRegexL = /<span>/gi;
	while ( (result = desRegexL.exec(content)) ) {
   		desIndicesLead.push(result.index);
	}

	var desRegexT = /<[\/]span>/gi;
	while ( (result = desRegexT.exec(content)) ) {
   		desIndicesTail.push(result.index);
	}

	if(urlIndicesLead.length === urlIndicesTail.length){
		for(var i=0;i<urlIndicesLead.length;i++){
			urlArray.push(content.substring(urlIndicesLead[i]+9,urlIndicesTail[i]+3));
		}
	}

	if(desIndicesLead.length === desIndicesTail.length){
		for(var i=0;i<desIndicesLead.length;i++){
			desArray.push(content.substring(desIndicesLead[i]+6,desIndicesTail[i]));
		}
	}

	if(urlArray.length === desArray.length){
		for(var i=0;i<urlArray.length;i++){
			var imgObj = {
				url: urlArray[i],
				description: desArray[i]
			};
			imageObjectArray.push(imgObj);
		}
	}

	return imageObjectArray;
}

var CNAReplaceLinkTag = function(content){
	var result = undefined;
	var leaderIndices = [];
	var tailerIndices = [];
	var descriptionIndices = [];

	var hyperLinkLeader = /href="/gi;
	var hyperLinkTailer = /">/gi;
	var descriptionTailer = /<\/a>/gi;

	while ( (result = hyperLinkLeader.exec(content)) ) {
    	leaderIndices.push(result.index);
	}

	while ( (result = hyperLinkTailer.exec(content)) ) {
    	tailerIndices.push(result.index);
	}

	while ( (result = descriptionTailer.exec(content)) ) {
    	descriptionIndices.push(result.index);
	}

	if(leaderIndices.length !== tailerIndices.length || leaderIndices.length !== descriptionIndices.length){
		console.error('delete HtmlTag (<a><\\a>) Problem!');
		return content;
	}

	var url = [];
	var description = [];
	for(var i=0;i<leaderIndices.length;i++){
		url.push(content.substring(leaderIndices[i]+6,tailerIndices[i]));
	}

	for(var i=0;i<descriptionIndices.length;i++){
		description.push(content.substring(tailerIndices[i]+2,descriptionIndices[i]));
	}

	var toBeReplaced = /(<a)(.*)(\/a>)/;
	var contentToReturn = content;
	for(var i=0;i<url.length;i++){
		contentToReturn = contentToReturn.replace(toBeReplaced,description[i]+ ' (' + url[i] + ') ');
	}

	return contentToReturn;
}

/*
	summary:
			http request response parser for CNA news site.

	params: data (string) : data from http get request, which is a html file string
	return: object{title,time,content}
*/
var htmlToNewsObject = function(data){
	// Get Title
	var titleLeader = '<h1 itemprop="headline">';
	var titleTailer = '</h1>';
	var title = helper.getSubString(data,titleLeader,titleTailer);

	//Get Time Info
	var timeStartLeader = '<p>發稿時間：';
	var timeStartIndex = data.search(timeStartLeader);
	var postTime = data.substring(timeStartIndex + timeStartLeader.length, timeStartIndex + timeStartLeader.length +16);

	// Check the last renew time
	var renewTimeStartLeader = '最新更新：';
	var renewTimeStartIndex = data.search(renewTimeStartLeader);
	if(renewTimeStartIndex !== -1){
		postTime = data.substring(renewTimeStartIndex + renewTimeStartLeader.length, renewTimeStartIndex + renewTimeStartLeader.length +16);
	}

	// Get News Content
	var contextLeader = /[<\s*p\s*>\s*]（中央社/;
	var contextStartIndex = data.search(contextLeader);
	if(contextStartIndex === -1) contextStartIndex = data.search(/[<\s*p\s*>\s*](中央社/);
	if(contextStartIndex === -1) console.log('Cant find symbol: ' + contextLeader);

	// Get end index
	var contextTailer = /[0-9]{7}(<\s*[\/]?p>|<br\s*[\/]?><br\s*[\/]?>※你可能還想看：)/;
	var contextEndIndex = data.search(contextTailer);
	if(contextEndIndex === -1) contextEndIndex = data.search(/※你可能還想看/);
	if(contextEndIndex === -1) contextEndIndex = data.search(/。<\s*[\/]?p>/);
	if(contextEndIndex === -1) contextEndIndex = data.search(/[0-9]{7}<br\s*[\/]?><br\s*[\/]?>/);
	if(contextEndIndex === -1) console.log('Cant find symbol: tailer');

	if(contextStartIndex === -1 || contextEndIndex === -1) console.log('Err Title: ' + title);

	if( contextEndIndex !== -1 && contextStartIndex !== -1 && contextStartIndex < contextEndIndex)
		var context = data.substring(contextStartIndex + 1, contextEndIndex);
	else if(contextEndIndex === -1)
		var context = 'New Content trans error! (end)';
	else if(contextStartIndex === -1)
		var context = 'New Content trans error! (start)';
	else
		var context = 'New Content trans error, index wrong!';

	context = helper.deleteHTMLTags(context);
	context = CNAReplaceLinkTag(context);
	
	var imgArray = getImageObjectsFromContent(context);

	// Construct the news object to return
	var newsObjectToReturn = {
		title : title,
		time: postTime,
		content : context,
		image: imgArray,
	};
	if( contextEndIndex !== -1 && contextStartIndex !== -1)
		return newsObjectToReturn;
	else
		return null;
}

var getTagFromPath = function(path){
	var tagToReturn = '';
	if(path.indexOf('aipl') !== -1 || path.indexOf('firstnews') !== -1) tagToReturn = '頭條要聞';
	if(path.indexOf('asoc') !== -1) tagToReturn = '社會';
	if(path.indexOf('ahel') !== -1) tagToReturn = '生活';
	if(path.indexOf('afe') !== -1) tagToReturn = '財經';
	if(path.indexOf('aopl') !== -1) tagToReturn = '國際';
	if(path.indexOf('acn') !== -1) tagToReturn = '兩岸';
	if(path.indexOf('amov') !== -1) tagToReturn = '娛樂名人';
	if(path.indexOf('aspt') !== -1) tagToReturn = '體育';
	if(path.indexOf('aloc') !== -1) tagToReturn = '地方';

	return tagToReturn;
};

/*
	summary:
			http request response from CNA news site which contains paths.

	return: Paths(String Array)
*/
exports.getAllNewsLinks = function(){
	var newsLinks = new Promise(function(resolve,reject){
		console.log('Checking news from CNA...')
		helper.httpGetReturnRequestBody(newsHost,'/list/aall-1.aspx').then(
			function(data){
				var articleLeader = '<div class="article_list">';
				var articalTailer = 'class="pagination">';
				var articlesSubString = helper.getSubString(data,articleLeader,articalTailer);

				//console.log(articlesSubString);
				var index = 0;
				var pathgetToken = articlesSubString.match(/(<a href=')(.*)('>)/g);
			
				for(var i = 0 ; i < pathgetToken.length ; i++){
					pathgetToken[i] = pathgetToken[i].substring(9,pathgetToken[i].length-3) + 'x';
				}

				resolve(pathgetToken);
			},
			function(reason){
				reject(reason);
			}
		);
	});

	return newsLinks;
}

var getSingleNewsByPath = function(path, checkFunction, uploadFunctionSql, uploadFunctionDoc, useSummary, done){
	if(path.search('/news/') !== -1 && !checkFunction(md5(path))){
		helper.httpGetReturnRequestBody('www.cna.com.tw',path).then(function(data){
			var news = htmlToNewsObject(data);

			if(news !== null){
				news.dateTime = helper.createTimeByString(news.time.toString());
				news.classification = getTagFromPath(path);
				news.id = md5(path);
				news.url = newsHost + path;

				//db.newPostSQL( md5, time, title, url, source, tag)
				//parameter types( String, Date, String, String, String, String )
				uploadFunctionSql(news.id, news.dateTime, news.title, news.url, '中央社', news.classification);

				if(useSummary){
					summaryHelper.submitSummary(news, '中央社', uploadFunctionDoc);
				}else{
					//db.newPostDOC( md5, keywords, content, images)
					//parameter types( String, [String], String, [ {url: String, description: String} ] )
					uploadFunctionDoc(news.id, [],news.content, news.image);
				}
			}

			return done();
		},
		function(reason){
			console.log(reason);
		})
	}
};

/*
	Summary: 
		by reading paths in the file in file <newsPathsFile>, do httpGetRequest,
		generate news object and write the result to the file 
		(change the string './news.txt' to change the dest file)

*/
exports.getAllNewsObjectByPathsArray = function(array, checkFunction, uploadFunctionSql, uploadFunctionDoc, useSummary){
	console.log('Retrieveing news from CNA...');

	eachSeries(array, function (prime, done) {
  		getSingleNewsByPath(prime, checkFunction, uploadFunctionSql, uploadFunctionDoc, useSummary, done);
	}, function (err) {
  		if (err) { throw err; }
  		console.log('CNA News Done!');
	});
	/*
	var count = array.length-1;
	while(count) {
		count = DO(count);
	}
	function DO(count){
		if (getSingleNewsByPath(array[count], checkFunction, uploadFunctionSql, uploadFunctionDoc, useSummary)) return count-1;
		else return 0;
	}
	*/
	/*
	array.forEach(function(path){
		getSingleNewsByPath(path, checkFunction, uploadFunctionSql, uploadFunctionDoc, useSummary);
	});
	*/
}