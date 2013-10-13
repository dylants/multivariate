var express = require("express"),
    fs = require("fs"),
    cons = require("consolidate"),
    app = express();

// configure the app (all environments)
app.configure(function() {
    // set the port
    app.set("port", 3000);

    // configure view rendering (underscore)
    app.engine("html", cons.underscore);
    app.set("view engine", "html");
    app.set("views", __dirname + "/views");

    // use express' body parser to access body elements later
    app.use(express.bodyParser());

    // pull in all the controllers (these contain routes)
    fs.readdirSync("controllers").forEach(function(controllerName) {
        require("./controllers/" + controllerName)(app);
    });

    // lock the router to process routes up to this point
    app.use(app.router);

    // static assets processed after routes
    app.use("/assets", express.static(__dirname + "/public"));
    app.use("/assets", express.static(__dirname + "/bower_components"));

    // pull the Google Analytics Tracking ID from the environment variable
    app.set("gaTrackingId", process.env.GA_TRACKING_ID || "");
});

// configuration for development environment
app.configure("development", function() {
    console.log("in development environment");
    app.use(express.errorHandler());
});

// configuration for production environment (NODE_ENV=production)
app.configure("production", function() {
    console.log("in production environment");
    // configure a generic 500 error message
    app.use(function(err, req, res, next) {
        res.send(500, "An error has occurred");
    });
});

// start the app
app.listen(app.get("port"), function() {
    console.log("Express server listening on port " + app.get("port"));
});
