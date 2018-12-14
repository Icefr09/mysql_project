var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "db_project"
});

/* GET home page. */
router.get('/', function(req, res, next) {

});

router.post('/login', function(req, res, next) {
  const email = req.body.username;
  const password = req.body.password;
  con.connect(function(err) {
    if (err) throw err;
    //console.log("Connected!");
    const query1 = mysql.format(`Select * from user where uemail='?' and upassword=?` ,[email,password]);
    console.log(query1);
    con.query(query1, function (err, result, fields) {
      if (err) throw err;
      //console.log(result);
      res.send(result);
    });
  });
});

router.get('/signup', function(req, res, next) {
  console.log(__dirname);
  res.sendFile(__dirname+'/index.html');
});

module.exports = router;
