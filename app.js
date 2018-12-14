var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql');
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

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
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
  res.send(err,err.message);
});

// Express session middleware
const sessionStore = new MySqlStore({}, con);
app.use(session({
  key: 'session_cookie_name',
  secret: 'session_cookie_secret',
  store: sessionStore,
  resave: true,
  saveUninitialized: true
}));

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



// Passport config
const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(function(username, password, done) {
  if (!username || !password) {
    return done(null, false, {message: 'Username and password are both required!'});
  }

  con.query(`select * from user where uemail = '${username}'`, function (err, rows) {
    if (err) console.log(err);

    if (!rows.length) {
      return done(null, false, {message: 'Username is not registered'})
    }

    bcrypt.compare(password, rows[0].password, function(err, isMatch) {
      if (err) console.log(err);

      if (isMatch) {
        return done(null, rows[0]); // RowDataPacket { user_id: 1, username: 'williamtan', password: '12345678' }
      } else {
        return done(null, false, {message: 'Wrong password!'});
      }
    })
  });

}));

passport.serializeUser(function(sqlRow, done) {
  done(null, sqlRow.user_id);
});

passport.deserializeUser(function(id, done){
  con.query(`select * from user where uid = ${id}`, function (err, rows){
    done(err, rows[0]);
  });
});
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

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
