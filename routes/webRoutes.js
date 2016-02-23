var webController = require('./../controllers/webController');

module.exports = function(app, passport) {
    app.get("/", webController.Index);
    app.post('/signIn', passport.authenticate('local', {successRedirect: "/", failureRedirect: "/signIn"}));
    app.get('/signOut', webController.SignOut);
    app.get("/users", webController.Users);
    app.get("/signIn", webController.SignIn);
    app.post("/newUser", webController.NewUser);
}