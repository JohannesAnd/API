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
