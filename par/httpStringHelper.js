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
		console.log(stringI);
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
    		});
		}catch(err){
			reject(err);
		}
	});

	return httpTry;
};

/*
	summary
		delete the html tags in the news content
*/
exports.deleteHTMLTags = function(content){
	// TODO: we'll like to remove all html tags, and replace <br/><br/> as \n
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
