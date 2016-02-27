var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : process.env.dbuser,
    password : process.env.dbpassword,
    database : 'cars'
});

connection.connect();

exports.Root = function(req, res){
    res.json({Hello: req.user.name});
}

exports.GPS = function(req, res) {
    res.json({GPS: req.user.password});
}

exports.ReceiveData = function(req, res, cb) {
    
    res.status(200).send();
}

exports.PostTripVertex = function(req, res, cb) {
    var query = "INSERT INTO TripVertices SET ?";
    console.log(req.body);
    connection.query(query, req.body, function(err, rows){
        if (err) { return cb(err)}
        res.status(200).send();
    });
}
