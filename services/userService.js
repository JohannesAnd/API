var mysql      = require("mysql");
var connection = mysql.createConnection({
    host     : "localhost",
    user     : process.env.dbuser,
    password : process.env.dbpassword,
    database : "cars"
});

connection.connect();

exports.checkUserName = function(name, cb) {
    var help = null;
    connection.query("SELECT * FROM Users WHERE name = ?", name, function(err, rows){
        if (name.length <= 1)
            help = "Username is too short!";
        else if (rows.length !== 0)
            help = "Username is already taken!";
        cb(err, help);
    });
};

exports.getUserById = function (id, cb) {
    var query = "SELECT * FROM Users WHERE id = ?";
    connection.query(query, id, function(err, rows){
        return cb(err, rows.length == 1 ? rows[0]: null);
    });
};

exports.updateUser = function (id, data, cb) {
    var query = "UPDATE Users SET ? WHERE id = ?";
    connection.query(query, [data, id], cb);
};

exports.getAllUsers = function getAllUsers(cb) {
    var query = "SELECT * FROM Users";
    connection.query(query, cb);
};

exports.newUser = function(data, cb){
    var query = "INSERT INTO Users SET ?";
    connection.query(query, data, cb);
};

exports.deleteUser = function(id, cb) {
    var query = "DELETE FROM Users WHERE id = ?";
    connection.query(query, id, cb);
};

exports.getRelatedUsers = function(user, cb) {
    if (user.is_admin)
        return exports.getAllUsers(cb);

    var query = "SELECT U.id, U.name FROM Users AS U " +
                    "JOIN OrgMembers AS OM ON OM.user_id = U.id " +
                "WHERE OM.org_id IN (" +
                    "SELECT org_id FROM OrgMembers " +
                    "WHERE user_id = ?) " +
                "GROUP BY U.id";
    connection.query(query, user.id, cb);
};

exports.parseUserForm = function(user, form, cb){
    var userData = {id: form.id, name: form.name, password: form.password, is_admin: false};
    if (user && user.is_admin)
        userData["is_admin"] = form.is_admin ? form.is_admin == "on" : false;
    if (form.password2 && form.password!==form.password2)
        return cb("Password does not match.");
    else if (form.password.length <= 5) 
        return cb("Password is too short.");
    else if (form.name.length <= 1)
        return cb("Name is to short.");
    return cb(null, userData);
};