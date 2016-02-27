var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : process.env.dbuser,
    password : process.env.dbpassword,
    database : 'cars'
});

connection.connect();

exports.getCarDetails = function(registration, cb) {
    var query = "SELECT * FROM TripVertices AS T WHERE T.registration = ? ORDER BY T.registration_time ASC";
    connection.query(query, registration, function(err, rows) {
        cb(null, rows);
    });
}