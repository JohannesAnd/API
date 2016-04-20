var moment = require("moment");
moment.locale("nb");

var carService = require("./../services/carService");
var organizationService = require("./../services/organizationService");
var userService = require("./../services/userService");

exports.Landing = function Landing(req, res, cb) {
    if(!req.user){
        return res.render("SigninLanding");
    }
    var user_id = req.user.id;
    organizationService.getUserTrips(user_id, 5, function(err, trips){
        if (err) { return cb(err); }
        organizationService.getUserOrganizations(user_id, function(err, orgs){
            if (err) { return cb(err); }
            res.render("LoggedInLanding", {trips: trips, orgs: orgs});
        });
    });
};

exports.SignOut = function signOut(req, res) {
    req.logout();
    res.redirect("/");
};

exports.NewUser = function newUser(req, res) {
    res.render("user/newUser", {error: req.query.error, formURL: "/newuser", retURL: "/"});
};

exports.CheckUsername = function checkUsername(req, res, cb) {
    var name = req.body.name;
    userService.checkUserName(name, function (err, nameError) {
        if (err) { return cb(err); }
        res.json({valid: nameError === null, help: nameError ? nameError: ""});
    });
};

/* USER(S) */

exports.Users = function users(req, res, cb) {
    userService.getRelatedUsers(req.user, function (err, rows) {
        if (err) { return cb(err); }
        res.render("user/users", {users: rows});
    });
};

exports.UserNew = function userNew(req, res) {
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
            if (req.body.id !== req.user.id && req.body.name === req.user.name){
                req.logout();
                return res.redirect("/");
            }
            return res.redirect("/users");
        });
    });
};

exports.PostUserNew = function postUserNew(req, res, cb) {
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

/* CAR */

exports.CarDetails = function carDetails(req, res, cb) {
    carService.getCarDetails(req.params.registration, function(err){
        if (err) { return cb(err); }
        res.render("car/CarDetails", {registration: req.params.registration});
    });
};


exports.CarEdit = function carEdit(req, res, cb) {
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

exports.CarDelete = function carDelete(req, res, cb) {
    carService.deleteCar(req.params.registration, function (err) {
        if (err) { return cb(err); }
        res.redirect("/organizations/" + req.params.orgid);
    });
};

exports.CarTrips = function carTrips(req, res, cb) {
    carService.getCarTripsWithRoute(req.params.registration, function(err, trips){
        if (err) {
            return cb(err);
        }
        res.render("car/Trips", {trips: trips, registration: req.params.registration});
    });
};

exports.CarTrip = function carTrip(req, res, cb) {
    carService.getTripVerticesFromTrip(req.params.tripid, function(err, rows){
        if (err) { return cb(err); }

        res.render("car/Trip", {vertices: rows, trip_id: req.params.orgid});
    });
};

exports.CarDeleteTrip = function carDeleteTrip(req, res, cb) {
    carService.deleteTrip(req.params.tripid, function (err) {
        if (err) { return cb(err); }
        res.redirect("/car/" + req.params.registration +"/trips");
    });
};

exports.PostCarEdit = function postCarEdit(req, res, cb) {
    carService.updateCar(req.params.registration, req.body, function (err) {
        if (err) { return cb(err); }
        res.redirect("/organizations/" + req.params.orgid);
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

exports.OrganizationNew = function newOrg(req, res) {
    res.render("organization/NewOrganization");
};

exports.OrganizationDetails = function orgDetails(req, res, cb) {
    var orgid = req.params.orgid;
    organizationService.getOrgDetailed(orgid, function (err, org) {
        if (err) { return cb(err); }
        organizationService.getUserOrgRole(req.user, orgid, function(err, role){
            if (err) { return cb(err); }
            res.render("organization/OrganizationDetails", {org: org, role: role});
        });
    });
};

exports.OrganizationNewCar = function organizationNewCar(req, res, cb) {
    var org_id = req.params.orgid;
    organizationService.getOrg(org_id, function (err, org) {
        if (err) { return cb(err); }
        res.render("car/carEdit", {
            title: org.name,
            subtitle: "New Car",
            post_url: "/organizations/"+org_id+"/newcar",
            buttonText: "Add car",
            values: {registration: "", make: "", type: "", prodYear: ""}
        });
    });
};

exports.OrganizationEdit = function editOrg(req, res, cb) {
    var id = req.params.orgid;
    organizationService.getUserOrgRole(req.user, id, function(err, role) {
        if (err) { return cb(err); }
        if (role == "Admin") {
            organizationService.getOrgDetailed(id, function(err, org) {
                if (err) { return cb(err); }
                res.render("organization/EditOrganization", {org: org});
            });
        } else {
            res.redirect("/organizations/" + id);
        }
    });
};

exports.OrganizationUsers = function getOrgUsers(req, res, cb) {
    organizationService.getUsersWithOrgRoles(req.params.orgid, function(err, users) {
        if (err) { return cb(err); }
        res.json({users: users});
    });
};

exports.OrganizationCarOverview = function co(req, res, cb) {
    organizationService.getOrg(req.params.orgid, function (err, org) {
        if (err) { return cb(err); }
        res.render("organization/CarOverview", {org: org});
    });
};

exports.OrganizationCarOverviewData = function cod(req, res, cb) {
    organizationService.getOrgCarOverviewData(req.params.orgid, function (err, cars) {
        if(err) { return cb(err); }
        res.json({cars: cars, serverTime: moment().format("Do MMMM YYYY HH:mm:ss")});
    });
};

exports.PostOrganizationNew = function postNewOrg(req, res, cb) {
    organizationService.newOrg(req.body.name, function (err) {
        if (err) { return cb(err); }
        res.redirect("/organizations");
    });
};

exports.PostOrganizationNewCar = function postNewOrganizationCar(req, res, cb) {
    req.body.organization_id = req.params.orgid;
    carService.newCar(req.body, function(err){
        if (err) { return cb(err); }
        res.redirect("/organizations/" + req.params.orgid);
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
