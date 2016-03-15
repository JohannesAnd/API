var webController = require("./../controllers/webController");

function ensureAuthenticated(req, res, next) {
    if (req.user) {
        return next();
    }else {
        res.redirect("/signIn");
    }
}

function ensureAdmin(req, res, next) {
    if (req.user && req.user.is_admin){
        return next();
    }else{
        res.redirect("/");
    }
}

module.exports = function(app, passport) {
    app.get("/", webController.Index);
    app.post("/signIn", passport.authenticate("local", {successRedirect: "/", failureRedirect: "/signIn"}));
    app.get("/signOut", webController.SignOut);
    app.get("/users", webController.Users);
    app.get("/signIn", webController.SignIn);
    app.post("/newUser", webController.NewUser);
    app.post("/checkUsername", webController.CheckUsername);

    app.get("/car/:registration", webController.CarDetails);
    app.get("/car/:registration/trip", webController.GetCarDetails);

    app.get("/car/:registration/trips", webController.GetCarTrips);
    app.get("/car/:registration/:trip", webController.GetCarTrip);

    app.get("/organizations", ensureAuthenticated, webController.OrganizationList);
    app.get("/organizations/new", ensureAdmin, webController.NewOrganization);
    app.post("/organizations/new", ensureAdmin, webController.PostNewOrganization);
    app.get("/organizations/:id", ensureAuthenticated, webController.OrganizationDetails);
    app.get("/organizations/:id/edit", ensureAuthenticated, webController.EditOrganization);
    app.get("/organizations/:id/getUsers", ensureAuthenticated, webController.GetOrgUsers);
    app.post("/organizations/:id/newCar", ensureAuthenticated, webController.NewCar);
    /*app.post("/organizations/:id/edit/addUser", ensureAuthenticated, webController.PostOrganizationAddUser);
    app.post("/organizations/:id/edit/addAdmin", ensureAuthenticated, webController.PostOrganizationAddAdmin);
    app.post("/organizations/:id/edit/removeUser", ensureAuthenticated, webController.PostOrganizationRemoveUser);
    app.post("/organizations/:id/edit/removeAdmin", ensureAuthenticated, webController.PostOrganizationRemoveAdmin);
    app.post("/organizations/:id/edit/addCar", ensureAuthenticated, webController.PostOrganizationAddAdmin);
    app.post("/organizations/:id/edit/removeCar", ensureAuthenticated, webController.PostOrganizationRemoveUser);

    NB! Må kanskje bruke ajax på noen av disse i bakgrunnen.... Idk.. Må iallefall løses på en elegant måte
    slik at man kan legge til og promotere brukere samt opprette biler til organisasjonen i realtime med oppdateringer av lister
    NB2! Tror jeg har glemt noe admin-validering, men er trøtt
    */
};