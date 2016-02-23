var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var passport = require('passport');
var HTTPBasicStrat = require('passport-http').BasicStrategy;

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : process.env.dbuser,
    password : process.env.dbpassword,
    database : 'cars'
});

connection.connect();

function validateUser(username, password, cb) {
    connection.query("SELECT * from Users WHERE name=?", username, function(err, rows){
        if (err) { return cb(err);}
        if (rows.length > 0){
            return cb(null, rows[0]);
        }else {
            return cb(null, false);
        }
    });
}

passport.use(new HTTPBasicStrat({}, validateUser));

app.set('views', './views');
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/views'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(passport.initialize());

var port = process.env.port || 9090;
var APIrouter = express.Router();
var WEBrouter = express.Router();

WEBrouter.get("/", function(req, res) {
    res.render('Index');
});

WEBrouter.get("/users", function(req, res, cb) {
    connection.query("SELECT * from Users", function(err, rows){
        if (err) { return cb(err);}
        res.render("UserList", {users: rows});
    });
});

WEBrouter.get("/signIn", function(req, res, cb) {
    res.render("SignIn");
});

WEBrouter.post("/newUser", function(req, res) {
    var form = req.body;
    var user = {name: form.name, password: form.password};
    if (form.password===form.password2 && form.password.length > 5 && form.name.length > 1){
        connection.query("INSERT INTO Users SET ?", user, function(err, rows){
            if (err) { return cb(err);}
            res.redirect("/users");
        });
    }
});

app.use("/api", passport.authenticate('basic', {session: false}));

APIrouter.get("/", function(req, res){
    console.log("Getting /api");
    res.json({Hello: req.user.name});
});

APIrouter.get("/gps_log", function(req, res) {
   res.json({GPS: req.user.password});
});

app.use("/api", APIrouter);
app.use("/", WEBrouter);

app.listen(port);
console.log("Magic is due on port "+port);
