var mysql = require("mysql");
var connection = mysql.createConnection({
    host: "localhost",
    user: process.env.dbuser,
    password: process.env.dbpassword,
    database: "cars"
});

connection.connect();

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

exports.getOrg = function(org_id, cb) {
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