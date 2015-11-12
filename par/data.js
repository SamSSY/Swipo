var http = require('http');
var fs = require('fs');

var httpGetReturnRequestBody = function(host, path){
	var httpTry = new Promise(function(resolve,reject){
		try{
			http.get({
        		host: host,
        		path: path
    		}, function(response) {
        	// Continuously update stream with data
        		var body = '';
        		response.on('data', function(d) {
            		body += d;
        		});
        		response.on('end', function() {
            		// Data reception is done, do whatever with it!
            		resolve(body);
        		});
    		});
		}catch(err){
			reject(err);
		}
	});

	return httpTry;
};

var htmlToNewsObject = function(data){
	// Get Title
	var titleLeader = '<h1 itemprop="headline">';
	var titleTailer = '</h1>';
	var titleStartIndex = data.search(titleLeader) + titleLeader.length;
	var titleEndIndex = data.search(titleTailer);

	var title = data.substring(titleStartIndex,titleEndIndex);

	//Get Time Info
	var timeStartLeader = '<p>發稿時間：';
	var timeStartIndex = data.search(timeStartLeader);
	var postTime = data.substring(timeStartIndex + timeStartLeader.length, timeStartIndex + timeStartLeader.length +16);

	var renewTimeStartLeader = '最新更新：';
	var renewTimeStartIndex = data.search(renewTimeStartLeader);
	if(renewTimeStartIndex !== -1){
		postTime = data.substring(renewTimeStartIndex + renewTimeStartLeader.length, renewTimeStartIndex + renewTimeStartLeader.length +16);
	}

	// Get News Content
	var contextLeader = '</div><p>';
	var contextTailer = '<br /><br />※你可能還想看：<br /><br />';
	var contextStartIndex = data.search(contextLeader) + contextLeader.length;
	var contextEndIndex = data.search(contextTailer);

	var context = data.substring(contextStartIndex,contextEndIndex);
	var brReplacer = /<br\s*[\/]?><br\s*[\/]?>/gi;
	context = context.replace(brReplacer,'\n');
	
	var newsObjectToReturn = {
		title : title,
		time: postTime,
		content : context,
	};

	return newsObjectToReturn;
}


httpGetReturnRequestBody('www.cna.com.tw','/news/firstnews/201511045022.aspx').then(
	function(data){
		var news = htmlToNewsObject(data);
		console.log(news.title);
		console.log(news.time);
		console.log(news.content);
	},
	function(reason){
		console.log(reason);
	}
)



