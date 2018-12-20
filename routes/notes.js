const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "db_project"
});

let currentState;
let currentLong;
let currentLat;
let currentTime;

const auth = require('../config/auth');

router.get('/', auth.isUser, function(req, res) {
    console.log(req.user);
    const uid = req.user.uid;
    console.log(uid);
    console.log('trying to get all notes');
    con.query(`select * from note natural join location where uid = '${uid}'`, function (err, rows) {
        con.query(`select * from filter where uid = '${uid}'`, function (err, rows1) {
            res.render('notes', {
                data: rows,
                data1:rows1
            });
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
    const tname = req.body.tname;
    const uid = req.user.uid;
    let tid = 1;
    con.query(`insert into location (lname, llong, llat) values ('${lname}','${llong}','${llat}');`, function (err) {
        if(err) console.log(err,'insert location error');
        con.query(`select * from location where lname = '${lname}' and llong = '${llong}' and llat = '${llat}' `, function (err, rows) {
            if (err) console.log(err,'find location error');
            const lid = rows[0].lid;
            con.query(`insert into note (uid, lid, nradius, ntext, npostTime,nallow) values ('${uid}','${lid}','${nradius}','${ntext}',now(), 1); `, function (err,result) {
                if (err) console.log(err, 'add note error');
                else { console.log('add note success',result.insertId);}
                const nid = result.insertId;

                con.query(`select * from tag where tname = '${tname}' `, function (err, rows) {
                    if (!rows.length) {
                        con.query(`insert into tag (tname) values ('${tname}');`, function (err, tag) {
                            tid = tag.insertId;
                            con.query(`insert into has_tag (tid,nid) values ('${tid}','${nid}');`, function (err) {
                                res.redirect('/notes');
                            });
                        });
                    } else {
                        tid = rows[0].tid;
                        con.query(`insert into has_tag (tid,nid) values ('${tid}','${nid}');`, function (err) {
                            res.redirect('/notes');
                        });
                    }
                    //res.redirect('/notes');
                });
            });
        });
    });
});

router.post('/select', function(req, res, next) {
    console.log(req.body);
    currentState = req.body.state;
    currentLat = req.body.lat;
    currentLong = req.body.long;
    currentTime = req.body.time;
    res.redirect('/notes/filtered');
});

router.get('/filtered1', auth.isUser, function(req, res) {
    const uid = req.user.uid;
    console.log('trying to get filtered notes');
    con.query(`select * from filter natural join user where uid = '${uid}'`, function (err, rows) {
        const count = rows.length;
        console.log(rows,count);

        con.query(`select * from notes`, function (err, rows1) {
            renderNotes(req,res,rows,rows1);
        });

    });


});

router.get('/filtered', auth.isUser, function(req, res) {
    const uid = req.user.uid;
    console.log('trying to get filtered notes');
    con.query(`with temp1 as(
select *
from filter
where uid = '${uid}' and flong < '${currentLong}' and flat < '${currentLat}'  and state = '${currentState}' 
)
select distinct nid, ntext, npostTime, lname, uid
from temp1 natural join has_tag natural join note natural join location;`, function (err, rows) {
        const count = rows.length;
        console.log(rows,count);
        res.render('filtered', {
            data: rows
        });


    });


});

function renderNotes(req,res,rows,rows1) {
    const count = rows.length;
    const uid = req.user.uid;

}

router.post('/addfilter', function(req,res) {
    console.log(req.body);
    const state = req.body.state;
    let receiveFrom = req.body.receiveFrom;
    const flong = req.body.flong;
    const flat = req.body.flat;
    const fradius = req.body.fradius;
    const tname = req.body.tname;
    const startTime = req.body.startTime
    const endTime = req.body.endTime;
    const uid = req.user.uid;
    if (receiveFrom !=1 ) {
        receiveFrom = 0;
    }
    con.query(`select tid from tag where tname = '${tname}'`, function (err, rows) {
        const tid = rows[0].tid;
        con.query(`insert into filter (uid, state, receive_from, tid, flong, flat, fradius, startTime, endTime) values ('${uid}','${state}','${receiveFrom}','${tid}','${flong}','${flat}','${fradius}',now(), now()) `, function (err) {
            res.redirect('/notes')
        });

    });
});


module.exports = router;