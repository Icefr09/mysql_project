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
            con.query( `select * from relationship R join user U on U.uid = R.uid2 where uid1 = '${uid}'`, function (err, rows3){
                con.query( `select * from relationship R join user U on U.uid = R.uid1 where uid2 = '${uid}'`, function (err, rows4){
                    res.render('notes', {
                        data: rows,
                        data1: rows1,
                        data3: rows3,
                        data4: rows4
                    });
                });
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
from filter as f
where 
111.111 *
DEGREES(ACOS(COS(RADIANS('${currentLat}'))
         * COS(RADIANS(f.flat))
         * COS(RADIANS('${currentLong}' - f.flong))
         + SIN(RADIANS('${currentLat}'))
         * SIN(RADIANS(f.flat)))) <= (fradius * 0.9144 * 0.001) and
             uid = '${uid}' and
             state = '${currentState}'
             )
select distinct nid, ntext, npostTime, lname, note.uid
from temp1 natural join has_tag join note using (nid) natural join location
where 
111.111 *
DEGREES(ACOS(COS(RADIANS(llat))
         * COS(RADIANS(flat))
         * COS(RADIANS(llong - flong))
         + SIN(RADIANS(llat))
         * SIN(RADIANS(flat)))) <= (fradius * 0.9144 * 0.001)`, function (err, rows) {
        if (err) {console.log(err);}
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
        con.query(`insert into filter (uid, state, receive_from, tid, flong, flat, fradius, startTime, endTime) values ('${uid}','${state}','${receiveFrom}','${tid}','${flong}','${flat}','${fradius}',FLOOR(
             TIME_TO_SEC('15:00:00') - RAND() * (
                  TIME_TO_SEC(TIMEDIFF('22:00:00', '15:00:00'))
             )
          ), FLOOR(
             TIME_TO_SEC('15:00:00') + RAND() * (
                  TIME_TO_SEC(TIMEDIFF('22:00:00', '15:00:00'))
             )
          )) `, function (err) {
            res.redirect('/notes')
        });

    });
});


router.post('/addfriend', function(req,res) {
    console.log(req.body);
    const friendID = req.body.friendID;
    const uid = req.user.uid;
    con.query(`insert into relationship (uid1, uid2, actionuid, status) values ('${uid}','${friendID}','${uid}',0) `, function (err) {
        res.redirect('/notes')
    });
});


router.get('/detail', auth.isUser, function(req, res) {
    const uid = req.user.uid;
    const nid = req.query.nid;
    console.log('trying to get details of node with ID', nid);
    con.query(`select * from note where nid = '${nid}'`, function (err, rows) {
        //console.log(rows);
        con.query(`select * from note natural join comment where nid = '${nid}'`, function (err, rows1) {
            res.render('note_detail', {
                data: rows[0],
                data1:rows1
            });
        });
    });
});

router.post('/comment', function(req,res) {
    console.log(req.body);
    const text = req.body.text;
    const nid = req.query.nid;
    const uid = req.user.uid;
    con.query(`insert into comment (uid, nid, ctext, cpostTime) values ('${uid}','${nid}','${text}',now()) `, function (err) {
        res.redirect(`back`)
    });
});



module.exports = router;