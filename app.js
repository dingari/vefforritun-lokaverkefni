'use strict';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var routes = require('./routes/index');
var users = require('./routes/users');
var auth = require('./routes/auth');
var entries = require('./routes/entries');

var app = express();
app.locals.pretty = true;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var cookie = { 
	domain: '',
	httpOnly: false,
	secure: false
};

app.use(session({
  secret: 'session secret!',
  resave: false,
  saveUninitialized: true,
  cookie: cookie,
  name: 'session'
}));

// Get access to the session object in jade
app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/', auth);
app.use('/entries', entries);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
	  message: err.message,
	  error: err
	});
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
	message: err.message,
	error: {}
  });
});


module.exports = app;
