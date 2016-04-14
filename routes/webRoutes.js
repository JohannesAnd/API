var webController = require("./../controllers/webController");
var organizationService = require("./../services/organizationService");
var carService = require("./../services/carService");

function ensureAuthenticated(req, res, next) {
    if (req.user) {
        return next();
    }else {
        return forbidden(res);
    }
}

function ensureAdmin(req, res, next) {
    if (req.user && req.user.is_admin){
        return next();
    }else{
        return forbidden(res);
    }
}

function ensureCanEditUser(req, res, next){
    if (req.user.id == req.params.userid)
        return next();
    else
        return ensureAdmin(req, res, next);
}


function ensureOrgAdmin(req, res, next) {
    var orgId = req.params.orgid;
    organizationService.getUserOrgRole(req.user, orgId, function(err, role){
        if (err) { return next(err); }
        else if (role == "Admin") { return next(); }
        return forbidden(res);
    });

}

function ensureOrgMember(req, res, next){
    var orgId = req.params.orgid;
    organizationService.getUserOrgRole(req.user, orgId, function(err, role){
        if (err) { return next(err); }
        else if (role) { return next(); }
        return forbidden(res);
    });
}

function ensureCarOrgAdmin(req, res, next){
    var reg = req.params.registration;
    carService.getCar(reg, function (err, car) {
        req.params.orgid = car.organization_id;
        return ensureOrgAdmin(req, res, next);
    });
}

function forbidden(res){
    res.status(403).render("forbidden");

}

module.exports = function(app, passport) {
    app.get("/",                webController.Landing);
    app.get("/signIn",          webController.Landing);
    app.get("/signOut",         webController.SignOut);
    app.get("/newUser",         webController.NewUser);

    app.post("/signIn",         passport.authenticate("local", {successRedirect: "/", failureRedirect: "/"}));
    app.post("/checkUsername",  webController.CheckUsername);

    /* USER(S) */
    app.get("/users",                   ensureAuthenticated, webController.Users);
    app.get("/users/new",               ensureAuthenticated, ensureAdmin, webController.UserNew);
    app.get("/users/:userid",           ensureAuthenticated, webController.UserShow);
    app.get("/users/:userid/edit",      ensureAuthenticated, ensureCanEditUser, webController.UserEdit);
    app.get("/users/:userid/delete",    ensureAuthenticated, ensureCanEditUser, webController.UserDelete);

    app.post("/users/:userid/edit",     ensureAuthenticated, ensureCanEditUser, webController.PostUserEdit);
    app.post("/users/new",              webController.PostUserNew);

    /* CAR */
    app.get("/car/:registration/edit",          ensureAuthenticated, ensureCarOrgAdmin, webController.CarEdit);
    app.get("/car/:registration/delete",        ensureAuthenticated, ensureCarOrgAdmin, webController.CarDelete);
    app.get("/car/:registration/trips",         ensureAuthenticated, webController.CarTrips);
    app.get("/car/:registration/:tripid/trip",  ensureAuthenticated, webController.CarTrip);
    app.get("/car/:registration/:tripid/delete",ensureAuthenticated, ensureCarOrgAdmin, webController.CarDeleteTrip);

    app.post("/car/:registration/edit",         ensureAuthenticated, ensureCarOrgAdmin, webController.PostCarEdit);

    /* ORGANIZATION */
    app.get("/organizations",                               ensureAuthenticated, webController.OrganizationList);
    app.get("/organizations/new",                           ensureAuthenticated, ensureAdmin, webController.OrganizationNew);
    app.get("/organizations/:orgid",                        ensureAuthenticated, ensureOrgMember, webController.OrganizationDetails);
    app.get("/organizations/:orgid/newcar",                 ensureAuthenticated, ensureOrgAdmin, webController.OrganizationNewCar);
    app.get("/organizations/:orgid/edit",                   ensureAuthenticated, ensureOrgAdmin, webController.OrganizationEdit);
    app.get("/organizations/:orgid/users",                  ensureAuthenticated, ensureOrgMember, webController.OrganizationUsers);
    app.get("/organizations/:orgid/carOverview",            ensureAuthenticated, ensureOrgMember, webController.OrganizationCarOverview);
    app.get("/organizations/:orgid/carOverview/data",       ensureAuthenticated, ensureOrgMember, webController.OrganizationCarOverviewData);

    app.post("/organizations/new",                          ensureAuthenticated, ensureAdmin, webController.PostOrganizationNew);
    app.post("/organizations/:orgid/newCar",                ensureAuthenticated, ensureOrgAdmin, webController.PostOrganizationNewCar);
    app.post("/organizations/:orgid/edit/addUser",          ensureAuthenticated, ensureOrgAdmin, webController.PostOrganizationAddUser);
    app.post("/organizations/:orgid/edit/addAdmin",         ensureAuthenticated, ensureOrgAdmin, webController.PostOrganizationAddAdmin);
    app.post("/organizations/:orgid/edit/removeUser",       ensureAuthenticated, ensureOrgAdmin, webController.PostOrganizationRemoveUser);
    app.post("/organizations/:orgid/edit/removeAdmin",      ensureAuthenticated, ensureOrgAdmin, webController.PostOrganizationRemoveAdmin);
    /*app.post("/organizations/:id/edit/removeCar", ensureOrgAdmin, webController.PostOrganizationRemoveUser);

    NB! Må kanskje bruke ajax på noen av disse i bakgrunnen.... Idk.. Må iallefall løses på en elegant måte
    slik at man kan legge til og promotere brukere samt opprette biler til organisasjonen i realtime med oppdateringer av lister
    NB2! Tror jeg har glemt noe admin-validering, men er trøtt
    */
};