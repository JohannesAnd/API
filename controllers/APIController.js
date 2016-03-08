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
    if (req.body.type === "trip") {
        connection.query("SELECT * FROM Users WHERE name=?", req.body.user_name, function(err, rows){
            var id = rows[0].id;
            var data = {
                "id": req.body.trip_id,
                "user_id": id,
                "car_id": req.body.car_registration
            };
            connection.query("INSERT INTO Trips SET ?", data, function(err){
                if (err) { return cb(err);}
                res.status(200).send();
            });
        });
    } else if (req.body.type === "data") {
        var data = {
            trip_id: req.body.trip_id,
            longitude: req.body.longitude,
            latitude: req.body.latitude,
            speed: req.body.speed,
            altitude: req.body.altitude,
            coolant_temp: req.body.coolant_temp,
            engine_load: req.body.engine_load,
            fuel_pressure: req.body.fuel_pressure,
            intake_air_temp: req.body.intake_air_temp,
            rpm:req.body.rpm,
            error_msg: String(req.body.errors),
            registration_time: req.body.registration_time
        };
        connection.query("INSERT INTO TripVertices SET ?", data, function(err){
            if (err) { return cb(err);}
            res.status(200).send();
        });
    } else {
        res.status(501).send();
    }
};
