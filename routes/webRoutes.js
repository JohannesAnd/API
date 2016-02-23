var webController = require('./../controllers/webController');

module.exports = function(app, passport) {
    app.get("/", webController.Index);
    app.post('/signIn', passport.authenticate('local'), webController.PostSignIn);
    app.get("/users", webController.Users);
    app.get("/signIn", webController.SignIn);
    app.post("/newUser", webController.NewUser);
}