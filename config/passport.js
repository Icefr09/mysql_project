const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "db_project"
});

module.exports = function(passport) {
    passport.use(new LocalStrategy(function(username, password, done) {
        if (!username || !password) {
            return done(null, false, {message: 'Username and password are both required!'});
        }

        con.query(`select * from user where uemail = '${username}'`, function (err, rows) {
            if (err) console.log(err);

            if (!rows.length) {
                return done(null, false, {message: 'Username is not registered'})
            }
        console.log(rows[0].upassword,password);


                if (password===rows[0].upassword) {
                    console.log('login success');
                    return done(null, rows[0]);
                } else {
                    return done(null, false, {message: 'Wrong password!'});
                }

        });

    }));

    passport.serializeUser(function(sqlRow, done) {
        console.log(sqlRow.uid,'uid here!');
        done(null, sqlRow.uid);
    });

    passport.deserializeUser(function(id, done){
        con.query(`select * from user where uid = ${id}`, function (err, rows){
            done(err, rows[0]);
        });
    });
};