var db = require('../util/db');
var UserSocket = module.exports = function (socket, id) {
	this.user = id;
	this.location = 'main';
	this.io = {};
	this.io['main'] = socket;
	this.listenMain(socket);
	db.onUserConnect(id);
	console.log('new');
	this.test = {};
}

UserSocket.prototype.emitCall = function(data) {
	this.io['location'].emit('get', data);
}
UserSocket.prototype.listenMain = function (io) {
	io.emit('done', {test: 'done'});

//	io.on('', function () {
		
//	});
};

UserSocket.prototype.listenLocation = function(io) {

	io.on('getNewsByCategory', function (data) {
		console.log('in');
		var send = ['sadfsad'];
		var prom = new Promise( function(res, rej) {
			db.getByCategory(data.category, function (array) {
				io.emit('returnMetaDataByCategory', array);
				array.forEach(function (el) {
					db.docById( el.id ).then( function (doc) {
						send.push(doc);
						if(send.length === array.length) res(send);
					});
				});
			});
		});
		prom.then( function (send){io.emit('returnContentDataByCategory', send); });
		
	}.bind(this) );
	io.on('getNewsByDate', function (data) {
		console.log('in');
		var send = [];
		var prom = new Promise( function(res, rej) {
			db.getByDate(data.date, function (array) {
				io.emit('returnMetaDataByDate', array);
				array.forEach(function (el) {
					db.docById( el.id ).then( function (doc) {
						send.push(doc);
						if(send.length === array.length) res(send);
					});
				});
			});
		});
		prom.then( function (send){io.emit('returnContentDateByDate', send); });
		
	}.bind(this) );

	io.on('getNewSwipe', function (data) {
		var send = [];
		var prom = new Promise (function (res, req) {
			db.get(data.user, function (array) {
				io.emit('returnNewMetaData', array);
				array.forEach(function (el) {
					db.docById( el.id ).then( function (doc) {
						send.push(doc);
						if(send.length === array.length) res(send);
					});
				});
			});
		});
		prom.then(function (send){io.emit('returnNewContentData', send); });
	});
 
	io.on('likeThePost', function (data) {
		db.swipe(1, data);
	});
	io.on('dislikeThePost', function (data) {
		db.swipe(0, data);
	});





	io.on('disconnect', function () {
		this.io = { main: io['main'] };
	});
};


UserSocket.prototype.newLocation = function (socket, data) {
	this.location = data.location;
	this.io['location'] = socket;
	this.listenLocation(socket);
};

/*UserSocket.prototype. = function(data) {
	
};*/