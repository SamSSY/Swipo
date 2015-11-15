//var mongoose = require('docooment');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var OID = Schema.ObjectId;
var postSchema = new mongoose.Schema({
	created_by: { type: OID, ref: 'User' },
	created_at: { type: Date, default: Date.now },
	text: String
});

var userSchema = new mongoose.Schema({
	username: String,
	password: String, //hash created from password
	created_at: { type: Date, default: Date.now }
});

var messageSchema = new mongoose.Schema({
	message: String	,
	user: String,
	time: Number
});

var roomSchema = new mongoose.Schema({
	users: [String],
	messages: [messageSchema]
});


mongoose.model('Post', postSchema);
mongoose.model('User', userSchema);
mongoose.model('Room', roomSchema);
