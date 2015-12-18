// import modules
var http = require('http');
var fs = require('fs');

// const strings
var newsHost = 'www.cna.com.tw';
var lastPathRecieved = '';
var newsPathsFile = './paths.txt';

// helper function
/*
	Summary:
		Get substring by leading substring and ending substring
	Params:
		StringI (string): the string source
		leadBy (string): the leading string of the wanted substring 
		endWith (string): the ending string of the wanted substring 
	Return: subStringToReturn (string) : the wanted substring

	example:
	var example = getSubstring('Ric\'s WebProgramming Project Final Project Product code ,'Web',/co../)
	console.log(example) //'Programming Project Final Project Product '
*/
var getSubString = function(stringI, leadBy, endWith){
	var startIndex = stringI.search(leadBy);
	var endIndex = stringI.search(endWith);
	if(startIndex === -1 || endIndex === -1) {
		console.log('Can\'t find substring!');
		if(startIndex === -1){
			console.log('Starter: ' + leadBy);
		}
		if(endIndex === -1){
			console.log('Tailer: ' +endWith);
		}
		console.log(stringI);
		return '';
	}
	var subStringToReturn = stringI.substring(startIndex + leadBy.length, endIndex);

	return subStringToReturn;
};

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

/*
	summary
		delete the html tags in the news content
*/
var deleteHTMLTags = function(content){
	// TODO: we'll like to remove all html tags, and replace <br/><br/> as \n
	// Remove the html tags (</p>...<p> or <blockquote....</blockquote> or <script>...</script>)
	
	var contentToReturn = content;
	/* Failed code here
	var result = undefined;
	var indicesLead = [];
	var indicesTail = [];
	var tagSubstrings = [];
	console.log('!' + contentToReturn);
	var contentToReturn = content.replace(/\n/gi,'');
	contentToReturn = contentToReturn.replace(/^[<\/p>][<p>]$/gi,'');

	console.log('!!' + contentToReturn);
	*/

	// Replace </br></br> as \n
	var brReplacer = /<br\s*[\/]?><br\s*[\/]?>/gi;
	contentToReturn = contentToReturn.replace(brReplacer,'\n');

	return contentToReturn;
}

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

	context = deleteHTMLTags(context);
	
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

/*
	summary:
			http request response from CNA news site which contains paths.

	return: Paths(String Array)
*/
var getAALLNewsLinks = function(){
	var newsLinks = new Promise(function(resolve,reject){
		console.log('Checking news from CNA...')
		httpGetReturnRequestBody(newsHost,'/list/aall-1.aspx').then(
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

/*
	Summary:
		read the path array get from the internet and check if the paths exists in the file,
		write the new paths into the file.

	Params:
		path (string) : the file path
		array (Array of string): the result get from httpRequest, which is an array of paths to news
	Return:
		promise
			use .then(function(){ successCallBack you want to do }, function(reason){...})
*/
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

/*
	Summary: 
		by reading paths in the file in file <newsPathsFile>, do httpGetRequest,
		generate news object and write the result to the file 
		(change the string './news.txt' to change the dest file)

*/
var getAllNewsObjectByPathsArray = function(){
	console.log('Retrieveing news content');
	var array = fs.readFileSync(newsPathsFile).toString().split('\n');
	if (array.length <=2) return;
	var newPathIndex = (lastPathRecieved === '')? 0 : array.indexOf(lastPathRecieved);
	newPathIndex = (newPathIndex === -1)? 0 : newPathIndex;

	fs.writeFile('./news.txt','');
	array.forEach(function(path){
		if(path.search('/news/') !== -1){
			httpGetReturnRequestBody('www.cna.com.tw',path).then(
				function(data){
					var news = htmlToNewsObject(data);
					news.path = path;
					news.liked = 0;
					news.disliked = 0;
						
					fs.appendFileSync('./news.txt', 'Title: ' + news.title.toString() + '\n');
					fs.appendFileSync('./news.txt', 'Path: ' + news.path.toString() + '\n');
					fs.appendFileSync('./news.txt', 'Time: ' + news.time.toString() + '\n');
					fs.appendFileSync('./news.txt', 'PicsAmount: ' + news.image.length.toString() + '\n');
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
/* 
	Summary:
		main function of data source server, which update news data from CNA every 5 min
*/
/*
console.log('News Listener now on!');

getAALLNewsLinks().then(function(data){
	updatePathsToFileByArray(newsPathsFile,data).then(function(){
		getAllNewsObjectByPathsArray();
		},function(err){
			console.log(err);
		});
	},function(reason){
		console.log(reason);
});

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
*/

/* Here's a test funciton for httpGet which write the response in ./test.txt
*/
httpGetReturnRequestBody('www.cna.com.tw','/news/aopl/201511240395-1.aspx').then(
	function(data){
		//console.log(data)
		var news = htmlToNewsObject(data);
		console.log(news.title);
		console.log(news.time);
		console.log(news.image.length);
		fs.appendFileSync('./test1.txt', news.content + '\n');

		for(var i=0;i<news.image.length;i++){
			//console.log(news.image[i].url);
			//console.log(news.image[i].description + '\n\n\n');
		}
	},
	function(reason){
		console.log(reason);
	}
);
/*
*/