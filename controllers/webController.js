var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : process.env.dbuser,
    password : process.env.dbpassword,
    database : 'cars'
});

connection.connect();

exports.Index = function(req, res) {
    res.render('Index');
}

exports.SignIn = function(req, res) {
    res.render("SignIn");
}

exports.SignOut = function(req, res) {
    req.logout();
    res.redirect("/");
}

exports.Users = function(req, res, cb) {
    connection.query("SELECT * from Users", function (err, rows) {
        if (err) {
            return cb(err);
        }
        res.render("UserList", {users: rows});
    });
}

exports.CheckUsername = function(req, res, cb) {
    var name = req.body.name;
    connection.query("SELECT * FROM Users WHERE name = ?", name, function(err, rows){
        if (err) {
            return cb(err);
        }
        if (name.length > 1){
            var valid = rows.length === 0
            var help = valid ? " " : "Username is already taken!";
        }else {
            var valid = false;
            var help = "Username is too short!";
        }
        res.json({valid: valid, help: help});
    });
}

exports.NewUser = function(req, res) {
    var form = req.body;
    var user = {name: form.name, password: form.password};
    if (form.password===form.password2 && form.password.length > 5 && form.name.length > 1){
        connection.query("INSERT INTO Users SET ?", user, function(err, rows){
            if (err) { return cb(err);}
            res.redirect("/users");
        });
    }
}

exports.OrganizationList = function(req, res, cb) {
    connection.query("SELECT * FROM Organizations", function(err, rows) {
        if (err) { return cb(err); }
        res.render("OrganizationsList", {organizations: rows})
    });
}