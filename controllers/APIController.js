var mysql      = require("mysql");
var connection = mysql.createConnection({
    host     : "localhost",
    user     : process.env.dbuser,
    password : process.env.dbpassword,
    database : "cars"
});

connection.connect();

exports.Root = function(req, res){
    res.json({Hello: req.user.name});
};

exports.GPS = function(req, res) {
    res.json({GPS: req.user.password});
};

exports.ReceiveData = function(req, res) {
    res.status(200).send();
};

exports.PostTripVertex = function(req, res, cb) {
    res.status(200).send();
    /*
    Needs updating
    var query = "INSERT INTO TripVertices SET ?";
    var data = {
        registration: req.body.registration,
        longitude: req.body.longitude,
        latitude: req.body.latitude,
        speed: req.body.speed,
        registration_time: req.body.registration_time
    };
    connection.query(query, data, function(err){
        if (err) { return cb(err);}
        res.status(200).send();
    });*/
};
