var db = require('./util/db');
var appleCrawler = require('./newsCrawler/AppleData');
var CNACrawler = require('./newsCrawler/CNAData');
//db.checkPath(path)
//return false if data from "path"(String) is not yet collected

//db.newPostSQL( md5, time, title, url, source, tag)
//parameter types( String, Date, String, String, String, String )

//db.newPostDOC( md5, keywords, content, images)
//parameter types( String, [String], String, [ {url: String, description: String} ] )

/*	

<(_ _)><(_ _)><(_ _)>start your code<(_ _)><(_ _)><(_ _)>

if ( db.checkPath(path) ) {

	~~start collecting~~

	db.newPost(...);

} else {
	~~next path~~~~
}
*/

var apple = true;
var cna = true;
var useSummary = false; 

// Apple Daily Crawler
if(apple){
	appleCrawler.getAllNewsLinks().then(
		function(paths){
			appleCrawler.getAllNewsObjectByPathsArray(paths, db.checkPath, db.newPostSQL, db.newPostDOC, useSummary);
		},
		function(reason){
			console.error(reason);
		}
);

	setInterval(function(){
		appleCrawler.getAllNewsLinks().then(
			function(paths){
				appleCrawler.getAllNewsObjectByPathsArray(paths, db.checkPath, db.newPostSQL, db.newPostDOC, useSummary);
			},
			function(reason){
				console.error(reason);
			}
		);
	},10*60*1000);
}

// CNA Crawler
if(cna){
	CNACrawler.getAllNewsLinks().then(
		function(paths){
			CNACrawler.getAllNewsObjectByPathsArray(paths, db.checkPath, db.newPostSQL, db.newPostDOC, useSummary);
		},
		function(reason){
			console.error(reason);
		}
	);

	setInterval(function(){
		CNACrawler.getAllNewsLinks().then(
			function(paths){
				CNACrawler.getAllNewsObjectByPathsArray(paths, db.checkPath, db.newPostSQL, db.newPostDOC, useSummary);
			},
			function(reason){
				console.error(reason);
			}
		);
	},5*60*1000);
}
