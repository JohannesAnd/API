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
}
        
exports.setOrgMember = function(userID, org, role, cb) {
    var query = "REPLACE into OrgMembers (user_id, org_id, role) VALUES(?, ?, ?)";
    connection.query(query, [userID, org, role], function results(err, rows) { cb(err); });
}

exports.removeFromOrg = function(userID, org, cb) {
    var query = "DELETE FROM OrgMembers WHERE user_id = ? AND org_id = ?";
    connection.query(query, [userID, org], function results(err, rows) { cb(err); });
}


exports.getUserRelatedOrgs = function(user, cb) {
    if(user.is_admin){
        var query = "SELECT * FROM Organizations";
        console.log("Test");
        connection.query(query, function(err, rows){ cb(err, rows); });
    }
    else{
        var query = "SELECT * FROM Organizations AS O " +
                        "JOIN OrgMembers as M ON O.id=M.org_id " +
                    "WHERE M.user_id = ?";
        connection.query(query, user.id, function(err, rows){ cb(err, rows); });
    }

}