var mysql      = require("mysql");
var connection = mysql.createConnection({
    host     : "localhost",
    user     : process.env.dbuser,
    password : process.env.dbpassword,
    database : "cars"
});

connection.connect();

exports.getCarDetails = function(registration, cb) {
    var query = "SELECT * FROM TripVertices AS T WHERE T.registration = ? ORDER BY T.registration_time ASC";
    connection.query(query, registration, function(err, rows) {
        cb(null, rows);
    });
};

exports.getCarsFromOrg = function(orgID, cb) {
    var query = "SELECT * FROM Cars WHERE organization_id=?"
    connection.query(query, orgID, function(err, rows){ cb(err, rows)} );
}