//var mongoose = require('docooment');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({
	idx: String,
	likes: [Number],
	dislikes: [Number],
	viewed: [Number],
	tags: [String],
	content: String,
	images: [String]
});

var userSchema = new Schema({
	idx: Number,
	likes: [Number],
	dislikes: [Number],
	viewed: [Number],
	tags: [String],
	friends: [Number]
});


mongoose.model('Post', postSchema);
mongoose.model('User', userSchema);
