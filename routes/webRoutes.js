var webController = require("./../controllers/webController");
var organizationService = require("./../services/organizationService");

function ensureAuthenticated(req, res, next) {
    if (req.user) {
        return next();
    }else {
        forbidden(res);
    }
}

function ensureAdmin(req, res, next) {
    if (req.user && req.user.is_admin){
        return next();
    }else{
        forbidden(res);
    }
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

function forbidden(res){
    res.status(403).render("forbidden");
}

module.exports = function(app, passport) {
    app.get("/",                webController.Landing);
    app.get("/signOut",         webController.SignOut);
    app.get("/signIn",          webController.SignIn);

    app.post("/signIn",         passport.authenticate("local", {successRedirect: "/", failureRedirect: "/"}));
    app.post("/newUser",        webController.NewUser);
    app.post("/checkUsername",  webController.CheckUsername);

    app.get("/users",                   ensureAuthenticated, webController.Users);
    app.get("/car/:registration",       ensureAuthenticated, webController.CarDetails);
    app.get("/car/:registration/trip",  ensureAuthenticated, webController.GetCarDetails);

    app.get("/car/:registration/trips",    ensureAuthenticated, webController.GetCarTrips);
    app.get("/car/:registration/:tripid/trip", ensureAuthenticated, webController.GetCarTrip);

    app.get("/organizations",                               ensureAuthenticated, webController.OrganizationList);
    app.get("/organizations/new",                           ensureAuthenticated, ensureAdmin, webController.NewOrganization);
    app.get("/organizations/:orgid",                        ensureAuthenticated, ensureOrgMember, webController.OrganizationDetails);
    app.get("/organizations/:orgid/edit",                   ensureAuthenticated, ensureOrgAdmin, webController.EditOrganization);
    app.get("/organizations/:orgid/getUsers",               ensureAuthenticated, ensureOrgMember, webController.GetOrgUsers);
    app.get("/organizations/:orgid/carOverview",            ensureAuthenticated, ensureOrgMember, webController.CarOverview);
    app.get("/organizations/:orgid/carOverview/getData",    ensureAuthenticated, ensureOrgMember, webController.CarOverviewData);

    app.post("/organizations/new",                          ensureAuthenticated, ensureAdmin, webController.PostNewOrganization);
    app.post("/organizations/:orgid/newCar",                ensureAuthenticated, ensureOrgAdmin, webController.NewCar);
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