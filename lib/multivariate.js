/**
 * Defines a new multivariate (A/B) test
 *
 * @param {String} testName A unique name for this test. This value will be used
 *                          as the cookie name, to remember users who were part
 *                          of this test.
 * @param {Object} options  Configuration options which include:
 *
 *        {Number} sample       The size of your audience you wish to participate
 *                              in this test, from 0 to 1. For example, if you wanted
 *                              to run this test on half your users, pass in 0.5. For
 *                              75% pass in 0.75. If not supplied, this defaults to 0.5.
 *
 *        {String} gaTrackingId If Google Analytics is desired, the Google
 *                              Analytics tracking ID must be supplied.
 *
 *        {Boolean} isDevEnv    If Google Analytics is enabled, this boolean is used
 *                              to determine if we're running in the development
 *                              environment (meaning on "localhost"). Google Analytics
 *                              creates a cookie and needs to know the domain does
 *                              not exist if running on localhost.
 */
function Multivariate(testName, options) {
    // first things first, verify the dependencies
    verifyDependencies();

    // assign a name for this test
    this.testName = testName;

    // if any options are supplied, use them, else defaults
    if (options) {
        this.sample = options.sample ? options.sample : 0.5;
        this.gaTrackingId = options.gaTrackingId ? options.gaTrackingId : null;
        this.isDevEnv = options.isDevEnv ? options.isDevEnv : false;
    }

    // used to determine if the user is in the test group or control group
    this.isInTest = null;

    // if Google Analytics is requested, let's configure it here
    if (this.gaTrackingId) {
        configureGoogleAnalytics(window, document,
            "script", "//www.google-analytics.com/analytics.js", "ga");
        createGoogleAnalytics(this.gaTrackingId, this.isDevEnv);
    }
}

/**
 * Verifies the dependencies of multivariate
 */
var verifyDependencies = function() {
    if (typeof window.$ === "undefined") {
        throw "jQuery must be available and in scope prior to using " +
            "multivariate. Please see http://jquery.com/download/ for " +
            "more information.";
    }
    if (typeof $.cookie === "undefined") {
        throw "jquery-cookie must be available and in scope prior to using " +
            "multivariate. Please see http://plugins.jquery.com/cookie/ " +
            "for more information.";
    }
};

/**
 * Returns true if the current user is in the test variant, false if the user
 * is in the control group (not in test).
 *
 * @return {Boolean} true if the user is in the test variant, false otherwise
 */
Multivariate.prototype.isTestVariant = function() {
    var testVariant;

    // if we've determined this before, return that value
    if (this.isInTest !== null) {
        return this.isInTest;
    }

    // first check to see if we've seen this user before (for this test)
    testVariant = $.cookie(this.testName);
    // if not...
    if (testVariant === undefined || testVariant === null) {
        // determine if the user should see the B test randomly
        testVariant = Math.random() < this.sample;

        // remember this value for later
        $.cookie(this.testName, testVariant);
    } else {
        // make sure to convert from string to boolean
        testVariant = (testVariant === "true");
    }

    // remember for later
    this.isInTest = testVariant;

    return this.isInTest;
};

/**
 * Executes the A/B test. If the user is in the test group, show all
 * elements with class "mv-test", and hide all elements with class "mv-control".
 * If not, the opposite is done ("mv-control" is shown, "mv-test" hidden).
 */
Multivariate.prototype.runTest = function() {
    if (this.isTestVariant()) {
        // if the user is in the test group, hide the control
        $(".mv-control").hide();
        // and show the test
        $(".mv-test").show();
    } else {
        // else, show the control
        $(".mv-control").show();
        // and hide the test
        $(".mv-test").hide();
    }
};

/* =============================== *
 * Google Analytics Helper Methods *
 * =============================== */

/**
 * Sends Google Analytics a message to track this page
 */
Multivariate.prototype.gaSendPageView = function() {
    ga("send", "pageview");
};

/**
 * Sends Google Analytics a custom dimemsion name and value
 *
 * @param  {String} dimensionName  The custom dimension name
 * @param  {String} dimensionValue The custom dimension value
 */
Multivariate.prototype.gaSetDimension = function(dimensionName, dimensionValue) {
    ga("set", dimensionName, dimensionValue);
};

/**
 * Binds a click event to send Google Analytics a custom event, with category
 * set to "button", action set to "click", and label set to the ID of the element.
 *
 * @param  {String} id The ID of the element to bind
 */
Multivariate.prototype.gaBindClickEvent = function(id) {
    $("#" + id).on("click", function() {
        ga("send", "event", "button", "click", id);
    });
};

/* ============================================== *
 * Private Google Analytics Configuration Methods *
 * ============================================== */

/**
 * Google Analytics configuration function taken from:
 * https://developers.google.com/analytics/devguides/collection/analyticsjs/
 */
var configureGoogleAnalytics = function(i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function() {
        (i[r].q = i[r].q || []).push(arguments);
    };
    i[r].l = 1 * new Date();
    a = s.createElement(o);
    m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m);
};

/**
 * Creates the Google Analytics tracker object, optionally configuring it
 * for a development environment (using localhost)
 *
 * @param  {String}  gaTrackingId The Google Analytics Tracking ID
 * @param  {Boolean} isDevEnv     Are we running in the development environment
 *                                (on localhost)?
 */
var createGoogleAnalyticsTracker = function(gaTrackingId, isDevEnv) {
    if (isDevEnv) {
        // set cookieDomain to none to test on localhost
        ga("create", gaTrackingId, {
            "cookieDomain": "none"
        });
    } else {
        ga("create", gaTrackingId);
    }
};
