const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');

const routes = require('./routes');

const app = express();

// use native ES6 promises for mongoose
mongoose.Promise = global.Promise;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/media', express.static(path.join(__dirname, 'media')));
app.use(cors());

require('./config/passport');

app.use(routes);

const isProduction = process.env.NODE_ENV === 'production';

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// connect to db
if (isProduction) {
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect('mongodb://localhost:27017/posts');
  mongoose.set('debug', true);
}

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
  console.log(`Successfully connected to database: ${db.name}`);
});


// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
app.use(function(err, req, res) {
  res.status(err.status || 500);
  
  let errObj = {};
  errObj.errors = {};
  errObj.errors[err.name] = err.message;

  res.json({
    success: false,
    errors: errObj
  });
});


module.exports = app;
