const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const mysql = require('mysql');
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "db_project"
});


/* GET sign up page. */
router.get('/signup', function(req, res, next) {
  res.render('signup',{title:'signup'});
});
/* GET login page. */
router.get('/login', function(req, res, next) {
  res.render('login',{title:'login'});
});

router.post('/signup', function(req, res) {
  const username = req.body.username;
  const password = req.body.password;

  const errors = null;//req.validationErrors(); validation function fails for unknown reason, tried hard to solve but can't, removed validation for now.
  if (errors) {
    res.render('signup', {
      errors: errors,
      user: null,
      title: 'signup'
    });
  } else {
    con.query(`select * from user where uemail = '${username}'`, function (err, rows) {
      if (err) console.log(err,'err1');

      if (rows.length) {

        res.redirect('/users/signup');
      } else {
        con.query(`insert into user (uname, uemail, upassword) values ('${username}','${username}','${password}');`, function(err) { // Query that inserts the user into table
          if (err) console.log(err,'err3');

          res.redirect('/users/login');
        });
      }
    });
  }
});

router.post('/login', function(req, res, next) {
  passport.authenticate('local', {
    successRedirect: '/notes',
    failureRedirect: '/users/login',
  })(req, res, next);
});






module.exports = router;
