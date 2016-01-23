//var mongoose = require('docooment');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var swipeSchema = new Schema({
	id: String,
	time: Date,
});

var imageSchema = new Schema({
	url: String,
	description: String
});

var postSchema = new Schema({
	id: String,
	likes: [swipeSchema],
	dislikes: [swipeSchema],
	content: String,
	images: [imageSchema],
	keywords: [String]
});

var tagSchema = new Schema({
	tag: String,
	count: Number 
});

var userSchema = new Schema({
	id: String,
	likes: [String],
	dislikes: [swipeSchema],
	friends: [swipeSchema],
	tags: [tagSchema]
});

mongoose.model('Post', postSchema);
mongoose.model('User', userSchema);
