var db = require('../util/db');
var UserSocket = module.exports = function (socket, user) {
	this.user = user;
	this.listen(socket);
	console.log('new');
}

UserSocket.prototype.listen = function (io) {
	io.emit('done', {test: 'done'});
	io.on('get', function (data) {
		console.log(data);
		io.emit('get', db.get());
	});
//	io.on('', function () {
		
//	});
};

/*UserSocket.prototype. = function(data) {
	
};*/