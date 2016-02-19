var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var passport = require('passport');
var HTTPBasicStrat = require('passport-http').BasicStrategy;

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'johannes',
    database : 'cars'
});

connection.connect();

passport.use(new HTTPBasicStrat({}, function(username, password, cb){
    connection.query("SELECT * from Users WHERE name=?", username, function(err, rows){
        if (err) { return cb(err);}
        if (rows.length > 0){
            return cb(null, rows[0]);
        }else {
            return cb(null, false);
        }
    });
}));

app.set('views', './views');
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/views'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(passport.initialize());

var port = process.env.port || 8080;
var router = express.Router();

app.get("/", function(req, res){
    res.render('UserList', {numbers: [5, 6, 2, 8]});
});

app.use("/api", passport.authenticate('basic', {session: false}));

router.get("/", function(req, res){
    console.log("Getting /api");
    res.json({Hello: req.user.name});
});

app.use("/api", router);

app.listen(port);
console.log("Magic is due on port "+port);
