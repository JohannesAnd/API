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
var userService = require("./../services/userService");

exports.Landing = function Landing(req, res) {
    if(!req.user){
        return res.render("SigninLanding");
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
    userService.getRelatedUsers(req.user, function (err, rows) {
        if (err) { return cb(err); }
        res.render("user/users", {users: rows});
    });
};

exports.UsersNew = function usersNew(req, res) {
    res.render("user/newUserDetailed", {error: req.query.error, formURL: "/users/new", retURL: "/users"});
};

exports.UserShow = function userShow(req, res, cb) {
    userService.getUserById(req.params.userid, function(err, user){
        if (err) { return cb(err); }
        res.render("user/userShow", {showingUser: user});
    });
};

exports.UserEdit = function userEdit(req, res, cb) {
    userService.getUserById(req.params.userid, function(err, user){
        if (err) { return cb(err); }
        res.render("user/userEdit", {
            title: user.name,
            subtitle: "Edit user",
            post_url: "/users/" + req.params.userid + "/edit",
            buttonText: "Save user",
            error: req.query.error,
            values: {id: user.id , is_admin: user.is_admin, name: user.name, password: user.password}
        });
    });
};

exports.UserDelete = function userDelete(req, res, cb) {
    userService.deleteUser(req.params.userid, function(err) {
        if (err) { return cb(err); }
        if (req.params.userid == req.user.id)
            return exports.SignOut(req, res, cb);
        return res.redirect("/users");
    });
};

exports.PostUserEdit = function postUserEdit(req, res, cb) {
    var form = req.body;
    userService.parseUserForm(req.user, form, function (err, updatedUser) {
        if (err) {
            return res.redirect("/users/" + req.params.userid + "/edit?error=" + err);
        }
        userService.updateUser(req.params.userid, updatedUser, function (err) {
            if (err) { return cb(err); }
            if (req.params.userid == req.userid && req.body.name != req.user.name){
                req.logout();
                return res.redirect("/");
            }
            return res.redirect("/users");
        });
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

exports.NewUser = function newUser(req, res) {
    res.render("user/newUser", {error: req.query.error, formURL: "/newuser", retURL: "/"});
};

exports.PostNewUser = function postNewUser(req, res, cb) {
    var form = req.body;
    userService.parseUserForm(req.user, form, function (err, newUser) {
        if (err) { 
            return res.redirect(req.query.formURL + "?error=" + err);
        }
        userService.newUser(newUser, function(err){
            if (err) { return cb(err);}
            return res.redirect(req.query.retURL);
        });
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

exports.PostOrganizationAddUser = function postOrganizationAddUser(req, res, cb) {
    var orgId = req.params.orgid;
    var user = req.body.user_id;
    organizationService.setOrgMember(user, orgId, "Member", function(err){
        if (err) { return cb(err); }
        return res.end();
    });
};

exports.PostOrganizationAddAdmin = function postOrganizationAddAdmin(req, res, cb) {
    var orgId = req.params.orgid;
    var user = req.body.user_id;
    organizationService.setOrgMember(user, orgId, "Admin", function(err){
        if (err) { return cb(err); }
        return res.end();
    });
};

exports.PostOrganizationRemoveUser = function postOrganizationRemoveUser(req, res, cb) {
    var orgId = req.params.orgid;
    var user = req.body.user_id;
    organizationService.removeFromOrg(user, orgId, function(err){
        if (err) { return cb(err); }
        return res.end();
    });
};

exports.PostOrganizationRemoveAdmin = function postOrganizationRemoveAdmin(req, res, cb) {
    var orgId = req.params.orgid;
    var user = req.body.user_id;
    organizationService.setOrgMember(user, orgId, "Member", function(err){
        if (err) { return cb(err); }
        return res.end();
    });
};

exports.OrganizationList = function orgList(req, res, cb) {
    organizationService.getUserRelatedOrgs(req.user, function(err, rows){
        if (err) {
            return cb(err);
        }
        var resDict = {};

        var endFunc = function(){
            res.render("organization/OrganizationsList", {organizations: resDict});
        };
        var status = 0;
        rows.forEach(function(row) {
            resDict[row.id] = row;
            carService.getCarsFromOrg(row.id, function (err, cars) {
                if (err) { return cb(err); }
                resDict[row.id]["cars"] = cars;
                status++;
                if(status == rows.length)
                    endFunc();
            });
        });
    });
};

exports.NewCar = function newCar(req, res, cb) {
    var org_id = req.params.orgid;
    organizationService.getOrg(org_id, function (err, org) {
        if (err) { return cb(err); }
        res.render("car/carEdit", {
            title: org.name,
            subtitle: "New Car",
            post_url: "/organizations/"+org_id+"/newCar",
            buttonText: "Add car",
            values: {registration: "", make: "", type: "", prodYear: ""}
        });
    });
};

exports.OrganizationDetails = function orgDetails(req, res, cb) {
    var orgid = req.params.orgid;
    organizationService.getOrg(orgid, function (err, org) {
        if (err) { return cb(err); }
        organizationService.getUserOrgRole(req.user, orgid, function(err, role){
            if (err) { return cb(err); }
            res.render("organization/OrganizationDetails", {org: org, role: role});
        });
    });
};

exports.CarDetails = function carDetails(req, res, cb) {
    carService.getCarDetails(req.params.registration, function(err){
        if (err) { return cb(err); }
        res.render("car/CarDetails", {registration: req.params.registration});
    });
};

exports.GetCarDetails = function getCarDetails(req, res, cb) {
    carService.getCarDetails(req.params.registration, function(err, data) {
        if (err) { return cb(err); }
        res.json({data: data});
    });
};

exports.DeleteCar = function deleteCar(req, res, cb) {
    carService.deleteCar(req.params.registration, function (err) {
        if (err) { return cb(err); }
        res.redirect("/organizations/" + req.params.orgid);
    });
};

exports.EditOrganization = function editOrg(req, res, cb) {
    var id = req.params.orgid;
    organizationService.getUserOrgRole(req.user, id, function(err, role) {
        if (err) { return cb(err); }
        if (role == "Admin") {
            organizationService.getOrg(id, function(err, org) {
                if (err) { return cb(err); }
                res.render("organization/EditOrganization", {org: org});
            });
        } else {
            res.redirect("/organizations/" + id);
        }
    });
};

exports.EditCar = function editCar(req, res, cb) {
    carService.getCar(req.params.registration, function(err, car){
        if (err) { return cb(err); }
        res.render("car/carEdit", {
            title: car.registration,
            subtitle: "Edit Car",
            post_url: "/car/"+car.registration+"/edit",
            buttonText: "Save car",
            values: {registration: car.registration, make: car.make, type: car.type, prodYear: car.prodYear }
        });
    });
};

exports.PostEditCar = function postEditCar(req, res, cb) {
    carService.updateCar(req.params.registration, req.body, function (err) {
        if (err) { return cb(err); }
        res.redirect("/organizations/" + req.params.orgid);
    });
};

exports.GetCarTrips = function getCarTrips(req, res, cb) {
    carService.getCarTripsWithRoute(req.params.registration, function(err, trips){
        if (err) {
            return cb(err);
        }
        res.render("car/Trips", {trips: trips, registration: req.params.registration});
    });
};

exports.GetCarTrip = function getCarTrip(req, res, cb) {
    carService.getTripVerticiesFromTrip(req.params.tripid, function(err, rows){
        if (err) { return cb(err); }

        res.render("car/Trip", {vertices: rows, trip_id: req.params.orgid});
    });
};

exports.GetOrgUsers = function getOrgUsers(req, res, cb) {
    organizationService.getUsersWithOrgRoles(req.params.orgid, function(err, rows) {
        if (err) { return cb(err); }
        res.json({users: rows});
    });
};

exports.PostNewOrganizationCar = function postNewOrganizationCar(req, res, cb) {
    req.body.organization_id = req.params.orgid;
    carService.newCar(req.body, function(err){
        if (err) { return cb(err); }
        res.redirect("/organizations/" + req.params.orgid);
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
