var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : process.env.dbuser,
    password : process.env.dbpassword,
    database : 'cars'
});

connection.connect();

exports.Index = function(req, res) {
    res.render('Index', {user: req.user});
}

exports.SignIn = function(req, res) {
    res.render("SignIn", {user: req.user});
}

exports.SignOut = function(req, res) {
    req.logout();
    res.redirect("/");
}

exports.PostSignIn = function(req, res) {
    res.redirect("/");
}

exports.Users = function(req, res, cb) {
    connection.query("SELECT * from Users", function (err, rows) {
        if (err) {
            return cb(err);
        }
        res.render("UserList", {users: rows, user: req.user});
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