//express
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//passport
var session = require('express-session');
var passport = require('passport');

//mongodb
require('./models/models');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/REM');

//docooment
/*require('./models/models');
var mongoose = require('docooment');
mongoose.connect('https://davidpass.documents.azure.com', 443, 'REM', {masterKey: '4mDisUQI+7SQJdOYmMLUnWfsMLeO1iYon3Tfxpq7fjCMr+M7IVuFNVV8HznP0eJ+9/CqpR+gzgcqZ+0oyBwk0A=='});
*/
var index = require('./routes/index');
var api = require('./routes/api')
var authenticate = require('./routes/authenticate')(passport);
var app = express();
app.io = index.io;

// view engine setup
app.set( 'views', path.join(__dirname, 'views'));
app.set( 'view engine', 'ejs');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use( logger('dev'));
app.use(session({
    secret: 'secret',
    //name: cookie_name,
    //store: sessionStore, // connect-mongo session store
    //proxy: true,
    resave: true,
    saveUninitialized: true
}));
app.use( bodyParser.json());
app.use( bodyParser.urlencoded({ extended: false }));
app.use( cookieParser());
app.use( express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', index);
//app.use('/' api);
app.use('/', authenticate);

var initPassport = require('./passport-init');
initPassport(passport);


// catch 404 and forward to error handler
app.use( function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if ( app.get('env') === 'development' ) {
  app.use( function(err, req, res, next) {
    res.status( err.status || 500 );
    res.render( 'error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use( function(err, req, res, next) {
  res.status( err.status || 500 );
  res.render( 'error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;