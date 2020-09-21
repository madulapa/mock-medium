var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var log = require('morgan');
var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = process.env.LOGGER_LEVEL; 

const keycloak = require('./kc.js').init();

const{user:userRouter, post:postRouter} = require('./routes');
var app = express();
app.use((req, res, next) => {
  req.headers.authorization = req.headers.authorization || '';
  return next();
});

app.use(log('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(/\/((?!login|register).)*/, keycloak.middleware());

app.use('/api/v1/user', userRouter);
app.use('/api/v1/post', postRouter);


app.get('/', (req, res) => {
  res.json({status:"Mock-medium server is running"});
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
