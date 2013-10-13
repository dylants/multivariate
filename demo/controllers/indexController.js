module.exports = function(app) {
    app.get("/", function(req, res) {
        // render the index.html page, with some variables passed in
        // for google analytics tracking ID and if this is development mode
        res.render("index.html", {
            "gaTrackingId": app.get("gaTrackingId"),
            "isDevEnv": (app.get("env") == "development")
        });
    });
};
