//var mongoose = require('docooment');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({
	id: String,
	likes: [swipeSchema],
	dislikes: [swipeSchema],
	content: String,
	images: [String]
});

var swipeSchema = new Schema({
	id: String,
	time: Date,
})
var imageSchema = new Schema({
	url: String,
	description: String
});

var userSchema = new Schema({
	id: String,
	likes: [String],
	dislikes: [swipeSchema],
	friends: [swipeSchema],
	tags: [TagSchema]
});

var TagSchema = new Scema({
	tag: String,
	count: Number 
})

mongoose.model('Post', postSchema);
mongoose.model('User', userSchema);
