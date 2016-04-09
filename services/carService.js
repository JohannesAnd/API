var mysql      = require("mysql");
var moment     = require("moment");
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

exports.getCarTripOverview = function(car_id, cb) {
    var query = "SELECT * FROM Trips AS T JOIN TripVertices AS TV ON TV.trip_id = T.id WHERE T.car_id=?";
    connection.query(query, car_id, function(err, rows){
        if (err) {
            cb(err);
        }
        var coords = {};
        rows.forEach(function(row) {
            if (row.id in coords) {
                coords[row.id]["vertices"] = coords[row.id]["vertices"] + "|" + row.latitude + "," + row.longitude;
            } else  {
                coords[row.id] = {
                    id: row.id,
                    date: moment(row.start_time).format("Do MMMM YYYY HH:mm:ss"),
                    fuelAverage: "N/A",
                    fuelUsed: "N/A",
                    kmDriven: "N/A"
                };
                coords[row.id]["vertices"] = row.latitude + "," + row.longitude;
            }
        });
        var result = [];
        for (var o in coords) {
            result.push(coords[o]);
        };
        var ordered = result.sort(function(a, b) {
            return b.start_time - a.start_time;
        });
        return cb(null, ordered);
    });
};