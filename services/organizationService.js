var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : process.env.dbuser,
    password : process.env.dbpassword,
    database : 'cars'
});

connection.connect();

exports.isOrganizationAdmin = function(user, orgID, cb) {
    if (user.is_admin) {
        cb(null, true);
    }else {
        var query = "SELECT * FROM OrgMembers AS O WHERE O.org_id = ? AND O.role = 'Admin' AND O.user_id = ?";
        connection.query(query, [orgID, user.id], function(err, rows) {
            if (err) { return cb(err)}
            cb(null, rows[0] ? true : false);
        });
    }
}