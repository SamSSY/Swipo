var http = require('http');
var exports = module.exports = {};

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
exports.getSubString = function(stringI, leadBy, endWith){
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
exports.httpGetReturnRequestBody = function(host, path){
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
    		}).on('error',function(e){
    			reject(e);
    		}).end();
		}catch(err){
			reject(err);
		}
	});

	return httpTry;
};

exports.createTimeByString = function(timeString){
	var regexD = /\//gi;
	var indeces = [];
	var result = undefined;

	while ( (result = regexD.exec(timeString)) ) {
    	indeces.push(result.index);
	}

	if(indeces.length !== 2) return new Date();

	var emptyIndex = timeString.indexOf(' ');
	emptyIndex = (emptyIndex === -1)? timeString.length : emptyIndex;
	var mIndex = timeString.indexOf(':');

	var year = Number(timeString.substring(0,indeces[0]));
	var month = Number(timeString.substring(indeces[0]+1,indeces[1]));
	var date = Number(timeString.substring(indeces[1]+1,emptyIndex));

	var hour = 0;
	var minute = 0;

	if(emptyIndex !== -1 && mIndex !== -1){
		hour = Number(timeString.substring(emptyIndex+1, mIndex));
		minute = Number(timeString.substring(mIndex+1, timeString.length));

		return new Date(year,month,date,hour,minute,0,0);
	}else{
		return new Date();
	}
	
}

exports.deleteHyperLinkTags = function(content){
	var result = undefined;
	var leaderIndices = [];
	var tailerIndices = [];

	var hyperLinkLeader = /(>)(\s)*(http|[0-9])/gi;
	var hyperLinkTailer = /<[\/]a>/gi;

	while ( (result = hyperLinkLeader.exec(content)) ) {
    	leaderIndices.push(result.index);
	}

	while ( (result = hyperLinkTailer.exec(content)) ) {
    	tailerIndices.push(result.index);
	}

	if(leaderIndices.length !== tailerIndices.length){
		console.error('delete HtmlTag (<a><\\a>) Problem!');
		return content;
	}

	var url = [];
	for(var i=0;i<leaderIndices.length;i++){
		url.push(content.substring(leaderIndices[i]+1,tailerIndices[i]));
	}

	var toBeReplaced = /(<a)(.*)(\/a>)/;
	var contentToReturn = content;
	for(var i=0;i<url.length;i++){
		contentToReturn = contentToReturn.replace(toBeReplaced,url[i]);
	}

	return contentToReturn;
}


/*
	summary:
		delete the html tags in the news content (remove <quoteblock/>, non-<p> region, <script/> and replace <br/> as '\n')
	param:
		content (string): the original content of the news
	return:
		contentToReturn (string): the string without html tags
*/
exports.deleteHTMLTags = function(content){
	// Remove the html tags (</p>...<p> or <blockquote....</blockquote> or <script>...</script>)
	var preContent = content;
	var contentToReturn = _deleteOneTag(preContent);
	while(preContent !== contentToReturn){
		preContent = contentToReturn;
		contentToReturn = _deleteOneTag(preContent);
	};

	//console.log(_deleteOneTag(content));

	// Replace </br></br> as \n
	if(preContent === contentToReturn){
		contentToReturn = contentToReturn.replace(/<br\s*[\/]?><br\s*[\/]?>/gi,'\n');
		return contentToReturn;
	}
};

var _deleteOneTag = function(content){
	var result = undefined;
	var indicesLead = [];
	var indicesTail = [];
	var indicesBr = [];
	var tagSubstrings = [];

	var tagRegexL = /(<[\/]p>|<block|<script)/gi;
	while ( (result = tagRegexL.exec(content)) ) {
    	indicesLead.push(result.index);
	}

	var tagRegexT = /(<p>|<\s*[\/]\s*blockquote>|<\s*[\/]\s*script>)/gi;
	while ( (result = tagRegexT.exec(content)) ) {
    	indicesTail.push(result.index);
	}

	if(indicesLead.length === 0 || indicesTail.length === 0)
		return content;

	var brRegex = /<br\s*[\/]?>/gi;
	while ( (result = brRegex.exec(content)) ) {
    	indicesBr.push(result.index);
	}

	for(var i=0; i<indicesLead.length; i++){
		for(var j=1; j<=indicesTail.length; j++){
			if(indicesLead[i] > indicesTail[indicesTail.length-j])
				return content;
			var findBr = false;
			for(var k=0;k<indicesBr.length;k++){
				if(indicesBr[k]>indicesLead[i] && indicesBr[k]<indicesTail[indicesTail.length-j]){
					findBr = true;
					break;
				}
			}
			if(!findBr){
				var cutLeadIndex = indicesLead[i];
				var cutTailIndex = indicesTail[indicesTail.length-j] + content.substring(indicesTail[indicesTail.length-j]).indexOf('>');
				var contentToReturn = content.replace(content.substring(cutLeadIndex,cutTailIndex+1),'');
				return contentToReturn;
			}
		}
	}

}
