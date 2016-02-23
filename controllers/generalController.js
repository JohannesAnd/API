var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : process.env.dbuser,
    password : process.env.dbpassword,
    database : 'cars'
});

connection.connect();

exports.ValidateUser = function validateUser(username, password, cb) {
    connection.query("SELECT * from Users WHERE name=?", username, function(err, rows){
        if (err) { return cb(err);}
        if (rows.length > 0){
            return cb(null, rows[0]);
        }else {
            return cb(null, false);
        }
    });
}

exports.SerializeUser = function(user, done){
    done(null, user.id);
}

exports.DeserializeUser = function(id, done){
    connection.query("SELECT * FROM Users WHERE id=?", id, function(err, rows){
        if (err) {return done(err);}
        done(null, rows[0]);
    });
}