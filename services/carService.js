var mysql      = require("mysql");
var moment     = require("moment");
var connection = mysql.createConnection({
    host     : "localhost",
    user     : process.env.dbuser,
    password : process.env.dbpassword,
    database : "cars"
});

connection.connect();

var MAX_STATIC_MAP_VERTICES = 140;

exports.getCarDetails = function(registration, cb) {
    var query = "SELECT * FROM TripVertices AS T WHERE T.registration = ? ORDER BY T.registration_time ASC";
    connection.query(query, registration, function(err, rows) {
        cb(null, rows);
    });
};

exports.getCar = function(registration, cb) {
    var query = "SELECT * FROM Cars WHERE registration = ?";
    connection.query(query, registration, function(err, rows){
        return cb(err, rows.length == 1 ? rows[0]: null);
    });
};

exports.newCar = function (data, cb) {
    var query = "INSERT INTO Cars SET ?";
    connection.query(query, data, cb);
};

exports.deleteCar = function (registration, cb) {
    var query = "DELETE FROM Cars WHERE registration = ?";
    connection.query(query, registration, cb);
};

exports.updateCar = function (registration, data, cb) {
    var query = "UPDATE Cars SET ? WHERE registration = ?";
    connection.query(query, [data, registration], cb);
};

exports.getCarsFromOrg = function(orgID, cb) {
    var query = "SELECT * FROM Cars WHERE organization_id=?";
    connection.query(query, orgID, cb);
};

exports.getCarTripsWithRoute = function(car_id, cb){
    var query = "SELECT T.id, T.user_id, T.car_id, T.start_time, U.Name AS user, TV.latitude, TV.longitude FROM Trips AS T " +
                    "JOIN TripVertices AS TV ON TV.trip_id = T.id " +
                    "JOIN Users AS U ON T.user_id = U.id " +
                "WHERE T.car_id=? ORDER BY T.start_time DESC ,TV.registration_time ASC";
    connection.query(query, car_id, function (err, rows) {
        if (err) {
            cb(err);
        }
        var trips = {};
        var nth = Math.ceil(rows.length/MAX_STATIC_MAP_VERTICES);
        rows.forEach(function (row, index) {
            if (index % nth === 0) {
                if (!(row.id in trips)){
                    trips[row.id] = row;
                    trips[row.id].start_time = moment(trips[row.id].start_time);
                    trips[row.id].route = [{lat: row.latitude, lon: row.longitude}];
                    delete trips[row.id].latitude;
                    delete trips[row.id].longitude;
                }
                else {
                    trips[row.id].route.push({lat: row.latitude, lon: row.longitude});
                }
            }
        });
        return cb(null, trips);
    });
};

exports.getTripVerticesFromTrip = function(tripID, cb) {
    var query = "SELECT * FROM TripVertices WHERE trip_id LIKE ? ORDER BY registration_time ASC";
    connection.query(query, tripID, cb);
};

exports.deleteTrip = function(tripID, cb){
    var query = "DELETE FROM Trips WHERE id = ?";
    connection.query(query, tripID, cb);
};
