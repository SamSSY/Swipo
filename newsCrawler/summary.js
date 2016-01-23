// import modules
var pythonShell = require('python-shell');

var exports = module.exports = {};

exports.submitSummary = function(news, source, uploadFunction){
	// Run Python script to generate a summary
	var result = [];
	summaryGenerater = new pythonShell('./newsCrawler/TextRank4ZH/example/summary.py');

	summaryGenerater.send(news.content.toString().replace(/\n/gi,''));
	summaryGenerater.on('message',function(message){
		result.push(message);
	});

	summaryGenerater.end(function(err){
		if(err) console.error('ERROR: ' + err);

		if(result.length === 2 && result[0] !== undefined && result[1] !== undefined){
			var tabRegex = /\t/gi;
	  		var textResult = undefined;
  			var indices = [];

	  		while ( (textResult = tabRegex.exec(result[1])) ) {
   				indices.push(textResult.index);
   			}

			var newsTags = [];
			var stopCount = (indices.length <= 3) ? indices.length : 3;
			for(var i=0;i<stopCount;i++){
				if(i === 0)
					newsTags.push(result[1].substring(0, indices[i]));
				else
					newsTags.push(result[1].substring(indices[i-1] + 1 , indices[i]));
			}

			if(source === '中央社')
				news.content = result[0];

			//db.newPost(id, time, title, url, source, classification, tags, content, images)
			//param types(string, Date, String, String, String, String, [String], String, [Object] )
			uploadFunction(news.id.toString(), news.dateTime, news.title.toString(), news.url.toString(), source, news.classification, newsTags, news.content.toString(), news.image);
		}
	});	
}