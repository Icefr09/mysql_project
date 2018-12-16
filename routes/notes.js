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

router.post('/add', function(req, res, next) {
    console.log(req.body);
    const ntext = req.body.ntext;
    const nradius = req.body.nradius;
    const lname = req.body.lname;
    const llat = req.body.llat;
    const llong = req.body.llong;
    const uid = req.user.uid;
    con.query(`insert into location (lname, llong, llat) values ('${lname}','${llong}','${llat}');`, function (err) {
        if(err) console.log(err,'insert location error');
        con.query(`select * from location where lname = '${lname}' and llong = '${llong}' and llat = '${llat}' `, function (err, rows) {
            if (err) console.log(err,'find location error');
            const lid = rows[0].lid;
            con.query(`insert into note (uid, lid, nradius, ntext, npostTime,nallow) values ('${uid}','${lid}','${nradius}','${ntext}',now(), 1); `, function (err) {
                if (err) console.log(err, 'add note error');
                else { console.log('add note success');}
                res.redirect('/notes');
            });
        });
    });
});

module.exports = router;