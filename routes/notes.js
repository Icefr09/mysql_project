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
    console.log(req.user);
    const uid = req.user.uid;
    console.log(uid);
    console.log('trying to get all notes');
    con.query(`select * from note where uid = '${uid}'`, function (err, rows) {
        res.render('notes', {
            data: rows
        });
    });
});


module.exports = router;