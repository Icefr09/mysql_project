var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');
const expressValidator = require('express-validator');
const messages = require('express-messages');
const passport = require('passport');
const MySqlStore = require('express-mysql-session')(session);
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "db_project"
});

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const signupRouter = require('./routes/signup');
const notesRouter = require('./routes/notes');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// Express session middleware
const sessionStore = new MySqlStore({}, con);
app.use(session({
  key: 'session_cookie_name',
  secret: 'session_cookie_secret',
  store: sessionStore,
  resave: true,
  saveUninitialized: true
}));

// import passport config
require('./config/passport')(passport);
// set passport middleware
app.use(passport.initialize());
app.use(passport.session());


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/notes', notesRouter);
//app.use('/signup', signupRouter);

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
  //res.send(err,err.message);
});


// Express validator middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }

    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));




// Set global variables
app.get('*', function(req, res, next) {
  res.locals.user = req.user || null; // if the user is logged in I'll have that user,  or it'll be null.
  next();
});

// Express messages middleware
app.use(require('connect-flash')());
app.use(function(req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});








module.exports = app;
