var mysql = require("mysql");
var moment     = require("moment");
var connection = mysql.createConnection({
    host: "localhost",
    user: process.env.dbuser,
    password: process.env.dbpassword,
    database: "cars"
});

connection.connect();

exports.newOrg = function (name, cb){
    var query = "INSERT INTO Organizations VALUES(null, ?)";
    connection.query(query, name, cb);
};

exports.getUserOrgRole = function(user, org, cb) {
    if (user.is_admin)
        return cb(null, "Admin");

    var query = "SELECT * FROM OrgMembers AS O WHERE O.org_id = ? AND O.user_id = ?";
    connection.query(query, [org, user.id], function results(err, rows) {
        if (err) {
            return cb(err);
        }
        return cb(null, rows[0] ? rows[0].role : null);
    });
};
        
exports.setOrgMember = function(userID, org, role, cb) {
    var query = "REPLACE into OrgMembers (user_id, org_id, role) VALUES(?, ?, ?)";
    connection.query(query, [userID, org, role], function results(err, rows) { cb(err, rows); });
};

exports.removeFromOrg = function(userID, org, cb) {
    var query = "DELETE FROM OrgMembers WHERE user_id = ? AND org_id = ?";
    connection.query(query, [userID, org], function results(err, rows) { cb(err, rows); });
};

exports.getUsersWithOrgRoles = function(orgID, cb) {
    var query = "SELECT * FROM (" +
                    "SELECT U.id, U.name, OM.role FROM Users AS U " +
                        "JOIN OrgMembers AS OM ON OM.user_id = U.id " +
                    "WHERE OM.org_id = ? " +
                    "UNION " +
                    "SELECT U.id, U.name, NULL as role FROM Users AS U " +
                        "LEFT JOIN OrgMembers AS OM ON OM.user_id = U.id " +
                    "WHERE OM.org_id <> ? OR OM.org_id IS NULL) AS C ";
    connection.query(query, [orgID, orgID], cb);
};

exports.getUserRelatedOrgs = function(user, cb) {
    if(user.is_admin){
        var adminQuery = "SELECT * FROM Organizations";
        connection.query(adminQuery, function(err, rows){ cb(err, rows); });
    }
    else{
        var query = "SELECT * FROM Organizations AS O " +
                        "JOIN OrgMembers as M ON O.id=M.org_id " +
                    "WHERE M.user_id = ?";
        connection.query(query, user.id, function(err, rows){ cb(err, rows); });
    }
};

exports.getOrgCarOverviewData = function(org_id, cb){
    var query = "SELECT * FROM Cars AS C " +
                    "JOIN Trips AS T ON T.car_id = C.registration " +
                    "JOIN TripVertices AS TV ON TV.trip_id = T.id " +
                "WHERE C.organization_id = ? AND registration_time IN (" +
                    "SELECT MAX(registration_time) FROM TripVertices " +
                        "JOIN Trips ON Trips.id = TripVertices.trip_id " +
                    "WHERE C.registration = Trips.car_id)";
    connection.query(query, org_id, function(err, rows) {
        if(err) { return cb(err); }
        var result = rows;
        result.forEach(function(row) {
            var date = moment(row.registration_time);
            row["registration_time"] = date.format("Do MMMM YYYY HH:mm:ss");
            row["active"] = date.isAfter(moment().subtract(2, "minute"));
        });
        cb(err, rows);
    });
};

exports.getOrg = function (org_id, cb) {
    var query = "SELECT * FROM Organizations WHERE id=?";
    connection.query(query, org_id, function(err, rows){
        return cb(err, rows.length == 1 ? rows[0]: null);
    });
};

exports.getOrgDetailed = function(org_id, cb) {
    var querys = {
        org:        "SELECT * FROM Organizations WHERE id = ?",
        orgCars:    "SELECT * FROM Organizations AS O " +
                        "JOIN Cars AS C ON O.id=C.organization_id " +
                    "WHERE O.id = ?",
        orgMembers: "SELECT * FROM Users AS U " +
                        "JOIN OrgMembers AS O ON O.user_id=U.id " +
                    "WHERE O.org_id = ?"
    };
    var error = null;

    var callBackHandler = function () {
        if (error) { return cb(error);}
        var org = querys["org"][0];
        org["cars"] = querys["orgCars"];
        org["members"] = querys["orgMembers"];

        cb(null, org);
    };

    var status = 0;
    for (var key in querys) {
        (function(key){
            connection.query(querys[key], org_id, function(err, rows){
                if (err) { error = err; }
                querys[key] = rows;
                status++;
                if (status == Object.keys(querys).length)
                    callBackHandler();
            });
        })(key);
    }
};

exports.getUserTrips = function(user_id, number, cb) {
    var query = "SELECT * FROM Trips WHERE Trips.user_id = ? ORDER BY Trips.start_time DESC";
    connection.query(query, user_id, cb);
};

exports.getUserOrganizations = function(user_id, cb) {
    var query = "SELECT O.id, O.name FROM Organizations AS O JOIN OrgMembers AS M ON O.id = M.org_id WHERE M.user_id = ? ORDER BY O.name DESC";
    connection.query(query, user_id, cb);
};