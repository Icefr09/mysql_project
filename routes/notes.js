const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "db_project"
});


const auth = require('../config/auth');

router.get('/', auth.isUser, function(req, res) {
    res.send("notes working");
});


module.exports = router;