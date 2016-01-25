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
	io.on('getNewSwipe', function (data) {
		io.emit('get', data);
		db.get( function(data) {
			this.test = data;
			io.emit('get', data);
			console.log('in func: ',  this.test);
		}.bind(this));
		//setTimeout(function(){console.log('outside: ',x); }, 10000);
	}.bind(this));

//	io.on('', function () {
		
//	});
};

UserSocket.prototype.listenLocation = function(io) {
	io.on('getNewsByCategory', function (data) {
		console.log('in');
		var send = ['sadfsad'];
		var prom = new Promise( function(res, rej) {
			db.getByCategory('sports', function (sql) {
				io.emit('returnMetaDataByCategory', sql);
				sql.forEach(function (el) {
					db.docByCategory( el ).then( function (data) {
						send.push(data);
						if(send.length === sql.length) res(send);
					});
				});
			});

		});
		prom.then( function (send){io.emit('returnContentDataByCategory', send); });
		
	}.bind(this) );
	io.on('getNewsByDate', function (data) {
		console.log('in');
		var send = ['sadfsad'];
		var prom = new Promise( function(res, rej) {
			db.getByDate('sports', function (sql) {
				io.emit('returnMetaDataByDate', sql);
				sql.forEach(function (el) {
					db.docByCategory( el ).then( function (data) {
						send.push(data);
						if(send.length === sql.length) res(send);
					});
				});
			});

		});
		prom.then( function (send){io.emit('returnContentDateByDate', send); });
		
	}.bind(this) );

	io.on('getNewSwipe', function (data) {
		db.getFeed(data.user);
	});
 
	io.on('likeThePost', function (data) {
		db.swpie(1, data);
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