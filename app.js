var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var log = require('morgan');
var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = process.env.LOGGER_LEVEL || 'debug';

const keycloak = require('./kc.js').init();

const { user: userRouter, post: postRouter } = require('./routes');
var app = express();

app.use(session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: true,
    store: keycloak.store
}));

// Making this empty atleast as keycloak middleware is causing an issue
app.use((req, res, next) => {
    req.headers.authorization = req.headers.authorization || '';
    return next();
});

app.use(log('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.json({ status: "Mock-medium server is running" });
});

// To skip keycloak middleware for login and register routes
// It's causing issue in parsing requests
app.use(/\/((?!api\/v1\/user\/login|api\/v1\/user\/register).)*/, keycloak.middleware());

app.use('/api/v1/user', userRouter);
app.use('/api/v1/post', postRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// // error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    return res.json(err);
});

module.exports = app;
