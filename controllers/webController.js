var mysql = require("mysql");
var moment = require("moment");
var connection = mysql.createConnection({
    host: "localhost",
    user: process.env.dbuser,
    password: process.env.dbpassword,
    database: "cars"
});
moment.locale("nb");

connection.connect();

var carService = require("./../services/carService");
var organizationService = require("./../services/organizationService");

exports.Landing = function Landing(req, res) {
    if(!req.user){
        res.render("SigninLanding");
        return
    }
    res.render("LoggedInLanding");
};

exports.SignIn = function signIn(req, res) {
    res.redirect("/");
};

exports.SignOut = function signOut(req, res) {
    req.logout();
    res.redirect("/");
};

exports.Users = function users(req, res, cb) {
    connection.query("SELECT * from Users", function (err, rows) {
        if (err) {
            return cb(err);
        }
        res.render("UserList", {users: rows});
    });
};

exports.CheckUsername = function checkUsername(req, res, cb) {
    var name = req.body.name;
    var valid = false;
    var help = "Username is too short!";
    connection.query("SELECT * FROM Users WHERE name = ?", name, function(err, rows){
        if (err) {
            return cb(err);
        }
        if (name.length > 1){
            valid = rows.length === 0;
            help = valid ? " " : "Username is already taken!";
        }
        res.json({valid: valid, help: help});
    });
};

exports.NewUser = function newUser(req, res, cb) {
    var form = req.body;
    var user = {id: form.id, name: form.name, password: form.password};
    if (form.password===form.password2 && form.password.length > 5 && form.name.length > 1){
        connection.query("INSERT INTO Users SET ?", user, function(err){
            if (err) { return cb(err);}
            res.redirect("/users");
        });
    }
    else
        res.redirect("/users"); // TODO! SHOULD GIVE ERROR!
};

exports.OrganizationList = function orgList(req, res, cb) {
    var query = "SELECT * FROM Organizations AS O LEFT JOIN Cars as C ON C.organization_id=O.id";

    connection.query(query, function(err, rows) {
        if (err) {
            return cb(err);
        }
        var resDict = {};
        rows.forEach(function(row) {
            if (row.id in resDict) {
                resDict[row.id]["cars"].push(row.registration);
            } else {
                resDict[row.id] = row;
                resDict[row.id]["cars"] = [row.registration];
            }
        });
        res.render("organization/OrganizationsList", {organizations: resDict});
    });
};

exports.NewOrganization = function newOrg(req, res) {
    res.render("organization/NewOrganization");
};

exports.PostNewOrganization = function postNewOrg(req, res, cb) {
    var name = req.body.name;
    var query = "INSERT INTO Organizations VALUES(null, ?)";
    connection.query(query, name, function(err){
        if (err) { return cb(err); }
        res.redirect("/organizations");
    });
};

exports.OrganizationDetails = function orgDetails(req, res, cb) {
    var org = {};
    var isAdmin;
    var id = req.params.id;
    var orgQuery = "SELECT * FROM Organizations AS O WHERE O.id = ?";
    var carQuery = "SELECT * FROM Cars AS C WHERE C.organization_id = ?";
    var userQuery = "SELECT * FROM OrgMembers as O JOIN Users AS U ON U.name=O.user_id WHERE O.org_id = ?";
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
};

exports.CarDetails = function carDetails(req, res, cb) {
    carService.getCarDetails(req.params.registration, function(err){
        if (err) { return cb(err); }
        res.render("car/CarDetails", {registration: req.params.registration});
    });
};

exports.GetCarDetails = function getCarDetails(req, res) {
    carService.getCarDetails(req.params.registration, function(err, data) {
        res.json({data: data});
    });
};

exports.EditOrganization = function editOrg(req, res, cb) {
    var id = req.params.id;
    organizationService.isOrganizationAdmin(req.user, id, function(err, isAdmin) {
        if (err) { return cb(err); }
        if (isAdmin) {
            var query = "SELECT * FROM Organizations WHERE id = ?";
            connection.query(query, id, function(err, rows) {
                res.render("organization/EditOrganization", {org: rows[0]});
            });
        } else{
            res.redirect("/organizations/" + id);
        }
    });
};

exports.GetCarTrips = function getCarTrips(req, res) {


    var rows = [
        {date:"Friday 24. March", fuelAverage:"0.08", fuelUsed:"1.2", kmDriven:"3.1", vertices:"63.4181,10.4067|63.4138, 10.41169|63.416093, 10.43160|63.42370, 10.411906|63.43027, 10.39216"},
        {date:"Wednesday 22. March", fuelAverage:"0.12", fuelUsed:"43.2", kmDriven:"204.1", vertices:"62.4181,10.4067|62.4138, 90.41169|62.416093, 10.43160|63.42370, 10.411906|63.43027, 10.39216"},
        {date:"Tuesday 21. March", fuelAverage:"0.21", fuelUsed:"8.1", kmDriven:"12.0", vertices:"53.4181,10.4067|53.4138, 11.41169|53.416093, 10.43160|53.42370, 10.411906|53.43027, 9.39216"}
    ];
    res.render("car/Trips", {trips: rows, registration: req.params.registration});


};

exports.GetCarTrip = function getCarTrip(req, res, cb) {
    var query = "SELECT * FROM TripVertices WHERE trip_id LIKE ?";
    connection.query(query, req.params.id, function(err, rows){
        if (err) { return cb(err); }

        res.render("car/Trip", {vertices: rows, trip_id: req.params.id});
    });
};

exports.GetOrgUsers = function getOrgUsers(req, res, cb) {
    var query = "SELECT DISTINCT U.name, U.is_admin, O.role, O.org_id FROM Users AS U LEFT JOIN OrgMembers AS O ON O.user_id = U.name ORDER BY U.name ASC";
    connection.query(query, req.params.id, function(err, rows) {
        if (err) { return cb(err); }
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
};

exports.NewCar = function NewCar(req, res, cb) {
    var query = "INSERT INTO Cars VALUES(?, ?, ?, ?, ?)";
    connection.query(query,
        [req.body.reg, req.body.make, req.body.model, req.body.year, req.params.id],
        function(err){
            if (err) { return cb(err); }
            res.redirect("/organizations/" + req.params.id + "/edit");
        });
};

exports.CarOverview = function co(req, res, next) {
    var query = "SELECT * FROM Organizations WHERE id=?";
    connection.query(query, req.params.orgid, function(err, rows) {
        if(err) {
            return next(err);
        }
        res.render("organization/CarOverview", {org: rows[0]});
    });
};

exports.CarOverviewData = function cod(req, res, next) {
    var query = "SELECT * FROM Cars AS C " +
                    "JOIN Trips AS T ON T.car_id = C.registration " +
                    "JOIN TripVertices AS TV ON TV.trip_id = T.id " +
                "WHERE registration_time IN (" +
                    "SELECT MAX(registration_time) FROM TripVertices " +
                        "JOIN Trips ON Trips.id = TripVertices.trip_id " +
                    "WHERE C.registration = Trips.car_id)";
    connection.query(query, function(err, rows) {
        if(err) {
            return next(err);
        }
        var result = rows;
        result.forEach(function(row) {
            var date = moment(row.registration_time);
            row["registration_time"] = date.format("Do MMMM YYYY HH:mm:ss");
            row["active"] = date.isAfter(moment().subtract(2, "minute"));
        });
        res.json({cars: rows});
    });
};
