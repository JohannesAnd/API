var APIController = require('./../controllers/APIController');

module.exports = function(app) {
    app.get("/", APIController.Root);
    app.get("/gps_log", APIController.GPS);
}