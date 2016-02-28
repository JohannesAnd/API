var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : process.env.dbuser,
    password : process.env.dbpassword,
    database : 'cars'
});

connection.connect();

var carService = require('./../services/carService');
var organizationService = require('./../services/organizationService');

exports.Index = function(req, res) {
    res.render('Index');
}

exports.SignIn = function(req, res) {
    res.render("SignIn");
}

exports.SignOut = function(req, res) {
    req.logout();
    res.redirect("/");
}

exports.Users = function(req, res, cb) {
    connection.query("SELECT * from Users", function (err, rows) {
        if (err) {
            return cb(err);
        }
        res.render("UserList", {users: rows});
    });
}

exports.CheckUsername = function(req, res, cb) {
    var name = req.body.name;
    connection.query("SELECT * FROM Users WHERE name = ?", name, function(err, rows){
        if (err) {
            return cb(err);
        }
        if (name.length > 1){
            var valid = rows.length === 0
            var help = valid ? " " : "Username is already taken!";
        }else {
            var valid = false;
            var help = "Username is too short!";
        }
        res.json({valid: valid, help: help});
    });
}

exports.NewUser = function(req, res) {
    var form = req.body;
    var user = {name: form.name, password: form.password};
    if (form.password===form.password2 && form.password.length > 5 && form.name.length > 1){
        connection.query("INSERT INTO Users SET ?", user, function(err, rows){
            if (err) { return cb(err);}
            res.redirect("/users");
        });
    }
}

exports.OrganizationList = function(req, res, cb) {
    var query = "SELECT * FROM Organizations AS O LEFT JOIN Cars as C ON C.organization_id=O.id";

    connection.query(query, function(err, rows) {
        if (err) { return cb(err); }
        var resDict = {}
        rows.forEach(function(row) {
            if (row.id in resDict) {
                resDict[row.id]["cars"].push(row.registration);
            } else {
                resDict[row.id] = row;
                resDict[row.id]["cars"] = [row.registration]
            }
        });
        res.render("organization/OrganizationsList", {organizations: resDict});
    });
}

exports.NewOrganization = function(req, res) {
    res.render("organization/NewOrganization");
}

exports.PostNewOrganization = function(req, res, cb) {
    var name = req.body.name;
    var query = "INSERT INTO Organizations VALUES(null, ?)";
    connection.query(query, name, function(err) {
        if (err) { return cb(err); }
        res.redirect("/organizations");
    });
}

exports.OrganizationDetails = function(req, res, cb) {
    var org = {};
    var isAdmin;
    var id = req.params.id;
    var orgQuery = "SELECT * FROM Organizations AS O WHERE O.id = ?";
    var carQuery = "SELECT * FROM Cars AS C WHERE C.organization_id = ?";
    var userQuery = "SELECT * FROM OrgMembers as O JOIN Users AS U ON U.id=O.user_id WHERE O.org_id = ?";
    connection.query(orgQuery, id, function(err, rows) {
        if (err) { return cb(err); }
        org = rows[0];
        connection.query(carQuery, id, function(err, rows) {
            if (err) { return cb(err); }
            org["cars"] = rows;
            connection.query(userQuery, id, function(err, rows) {
                if (err) { return cb(err); }
                org["members"] = rows;
                rows.forEach(function(user){
                    if (user.id === req.user.id && user.role === "Admin") {
                        isAdmin = true;
                    }
                });
                res.render("organization/OrganizationDetails", {org: org, is_admin: isAdmin});
            });
        });
    });
}

exports.CarDetails = function(req, res, cb) {
    carService.getCarDetails(req.params.registration, function(err, data){
        if (err) { return cb(err)}
        res.render("car/CarDetails", {registration: req.params.registration, data: data});
    });
}

exports.EditOrganization = function(req, res, cb) {
    var id = req.params.id;
    console.log(id);
    organizationService.isOrganizationAdmin(req.user, id, function(err, isAdmin) {
        if (err) { return cb(err)}
        console.log("IsAdmin? : " + isAdmin);
        if (isAdmin) {
            var query = "SELECT * FROM Organizations WHERE id = ?";
            connection.query(query, id, function(err, rows) {
                console.log(rows);
                res.render("organization/EditOrganization", {org: rows[0]});
            });
        } else{
            res.redirect("/organizations/" + id);
        }
    });
}

exports.GetOrgUsers = function(req, res, cb) {
    var query = "SELECT DISTINCT U.name, U.id, U.is_admin, O.role, O.org_id FROM Users AS U LEFT JOIN OrgMembers AS O ON O.user_id = U.id ORDER BY U.name ASC";
    connection.query(query, req.params.id, function(err, rows) {
        if (err) { return cb(err)}
        var results = {members: [], admins: [], users: []};
        rows.forEach(function(row){
            if (row.role === "Admin" && row.org_id === parseInt(req.params.id)) {
                results.admins.push(row);
            }else if (row.role === "Member" && row.org_id === parseInt(req.params.id)){
                results.members.push(row);
            }else { //Shows some users twice.. Must fix
                results.users.push(row);
            }
        });
        res.json({users: results});
    });
}
