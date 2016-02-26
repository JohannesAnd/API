var webController = require('./../controllers/webController');

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
    app.post('/signIn', passport.authenticate('local', {successRedirect: "/", failureRedirect: "/signIn"}));
    app.get('/signOut', webController.SignOut);
    app.get("/users", webController.Users);
    app.get("/signIn", webController.SignIn);
    app.post("/newUser", webController.NewUser);
    app.post("/checkUsername", webController.CheckUsername);

    app.get("/organizations", ensureAuthenticated, webController.OrganizationList)
}