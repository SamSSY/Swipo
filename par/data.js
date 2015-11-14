// import modules
var http = require('http');
var fs = require('fs');
 

var newsHost = 'www.cna.com.tw';
var lastPathRecieved = '';
var newsPathsFile = './paths.txt';

// helper function
var getSubString = function(stringI, leadBy, endWith){
	var startIndex = stringI.search(leadBy);
	var endIndex = stringI.search(endWith);
	if(startIndex === -1 || endIndex === -1) {
		console.log('Can\'t find substring!');
		return '';
	}
	var subStringToReturn = stringI.substring(startIndex + leadBy.length, endIndex);

	return subStringToReturn;
};

/*
	summary:
			function that use http get request and get data

	params: host (string): the host to send request
			path (string): the path of the host to send request
	return: httpGetRequest (promise)
			use .then(sccessCallBack(data),errorCallBack(reason))
*/
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
	var title = getSubString(data,titleLeader,titleTailer);

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
	var contextLeader = '<p>（中央社';
	var contextTailer = /[0-9]{7}\s*(<\s*[\/]?p>|<br\s*[\/]?><br\s*[\/]?>※你可能還想看：)/;
	var contextStartIndex = data.search(contextLeader);
	var contextEndIndex = data.search(contextTailer);
	if(contextStartIndex === -1) console.log('Cant find symbol: ' + contextLeader);
	if(contextEndIndex === -1) console.log('Cant find symbol: tailer');

	if( contextEndIndex !== -1 && contextStartIndex !== -1)
		var context = data.substring(contextStartIndex + 3, contextEndIndex);
	else if(contextEndIndex === -1)
		var context = 'New Content trans error! (end)';
	else
		var context = 'New Content trans error! (start)';
	var brReplacer = /<br\s*[\/]?><br\s*[\/]?>/gi;
	context = context.replace(brReplacer,'\n');
	
	// Construct the news object to return
	var newsObjectToReturn = {
		title : title,
		time: postTime,
		content : context,
	};

	return newsObjectToReturn;
}

/*
	summary:
			http request response from CNA news site which contains paths.

	return: Paths(String Array)
*/
var getAALLNewsLinks = function(){
	var newsLinks = new Promise(function(resolve,reject){
		console.log('Checking news from CNA...')
		httpGetReturnRequestBody(newsHost,'/list/aall-'+ '1' +'.aspx').then(
			function(data){
				var articleLeader = '<div class="article_list">';
				var articalTailer = 'class="pagination">';
				var articlesSubString = getSubString(data,articleLeader,articalTailer);

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

// TODO: Should have a version to online DB
var updatePathsToFileByArray = function(path,array){
	var promiseToReturn = new Promise(function(recieve,reject){
		try{
			var exitPaths = fs.readFileSync(path).toString().split('\n');
			var newPathIndex = (exitPaths.length >= 2)? array.indexOf(exitPaths[exitPaths.length - 2]) : array.length;
			newPathIndex = (newPathIndex === -1)? array.length : newPathIndex;
			if(newPathIndex === 0){
				console.log('No news from CNA now.');
			}else{
				console.log('Got ' + newPathIndex + ' news from CNA, retrieving paths...');
			}

			for(var i = newPathIndex - 1 ; i >= 0 ; i--){
				fs.appendFileSync(path, array[i].toString() + '\n');
				console.log('Path: '+ array[i] + ' written to '+ path);
			};
			recieve(fs.closeSync(newPathIndex));
		}catch(err){
			reject(err);
		}
	});


	return promiseToReturn;
}

var getAllNewsObjectByPathsArray = function(){
	console.log('Retrieveing news content');

	var array = fs.readFileSync(newsPathsFile).toString().split('\n');
	if (array.length <=2) return;

	fs.writeFile('./news.txt','');
	array.forEach(function(path){
		if(path.search('/news/') !== -1){
			httpGetReturnRequestBody('www.cna.com.tw',path).then(
				function(data){
					var news = htmlToNewsObject(data);
						news.path = path;
						fs.appendFileSync('./news.txt', 'Title: ' + news.title.toString() + '\n');
						fs.appendFileSync('./news.txt', 'Path: ' + news.path.toString() + '\n');
						fs.appendFileSync('./news.txt', 'Time: ' + news.time.toString() + '\n');
						fs.appendFileSync('./news.txt', news.content.toString() + '\n\n\n\n');
				},
				function(reason){
					console.log(reason);
				}
			)
		}
	});
}

// main
console.log('News Listener now on!');
setInterval(function(){
	getAALLNewsLinks().then(function(data){
		updatePathsToFileByArray(newsPathsFile,data).then(function(){
			getAllNewsObjectByPathsArray();
		},function(err){
			console.log(err);
		});
	},function(reason){
		console.log(reason);
	});
},5*60*1000);



/*
httpGetReturnRequestBody('www.cna.com.tw','/news/firstnews/201511145024-1.aspx').then(
	function(data){
		fs.appendFileSync('./test.txt', data + '\n');
		//console.log(data)
		var news = htmlToNewsObject(data);
		console.log(news.title);
		console.log(news.time);
		console.log(news.content);
	},
	function(reason){
		console.log(reason);
	}
)
*/