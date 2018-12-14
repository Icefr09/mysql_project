var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "db_project"
});

/* GET sign up page. */
router.get('/signup', function(req, res, next) {
  res.send("working");
  //res.sendFile(__dirname+'/signup.html');
});

module.exports = router;
