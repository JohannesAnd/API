var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');

var passport = require('passport');
var HTTPBasicStrat = require('passport-http').BasicStrategy;
var LocalStrat = require('passport-local').Strategy;

var webController = require('./controllers/webController');
var APIController = require('./controllers/APIController');
var generalController = require('./controllers/generalController');

passport.use(new HTTPBasicStrat({}, generalController.ValidateUser));
passport.use(new LocalStrat(generalController.ValidateUser));

app.set('views', './views');
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/views'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressSession({
    secret: process.env.secret || "secret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(generalController.SerializeUser);
passport.deserializeUser(generalController.DeserializeUser);

app.use(function(req, res, next){
    res.locals.user = req.user;
    next();
});

var port = process.env.port || 8080;
var APIrouter = express.Router();
var WEBrouter = express.Router();
require('./routes/webRoutes')(WEBrouter, passport);
require('./routes/APIRoutes')(APIrouter);

app.use("/api", passport.authenticate('basic', {session: false}));
app.use("/api", APIrouter);
app.use("/", WEBrouter);

app.listen(port);
console.log("Magic is due on port "+port);
