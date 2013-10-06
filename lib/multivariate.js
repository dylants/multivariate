/**
 * Defines a new multivariate (A/B) test
 *
 * @param {String} testName A unique name for this test. This value will be used
 *                          as the cookie name, to remember users who were part
 *                          of this test.
 * @param {Object} options  Configuration options which include:
 *
 *        {Number} sample       The size of the audience you wish to participate
 *                              in this A/B test, from 0 to 100. For example, if you
 *                              want to run this test on half your users, pass in
 *                              50 to represent 50% sample size. For a 75% sample
 *                              size, pass in 75. The default value is 50.
 *
 *        {String} gaTrackingId If Google Analytics is desired, the Google
 *                              Analytics tracking ID must be supplied.  This
 *                              String is usually of the form "UA-XXXX-Y".
 *                              By supplying this value you enable Google Analytics
 *                              for multivariate test pages. If this value is not
 *                              supplied, Google Analytics support will be disabled.
 *
 *        {Boolean} isDevEnv    If Google Analytics is enabled, this boolean is used
 *                              to determine if we're running in the development
 *                              environment (meaning on "localhost"). Google Analytics
 *                              creates a cookie and needs to know the domain does
 *                              not exist if running on localhost. The default value
 *                              is false.
 */
function Multivariate(testName, options) {
    // assign a name for this test
    this.testName = testName;

    // if any options are supplied, use them, else defaults
    if (options) {
        this.sample = options.sample ? options.sample : 50;
        this.gaTrackingId = options.gaTrackingId ? options.gaTrackingId : null;
        this.isDevEnv = options.isDevEnv ? options.isDevEnv : false;
    }

    // used to determine if the user is in the test group or control group
    this.isInTest = null;

    // if Google Analytics is requested, let's configure it here
    if (this.gaTrackingId) {
        configureGoogleAnalytics(window, document,
            "script", "//www.google-analytics.com/analytics.js", "ga");
        createGoogleAnalyticsTracker(this.gaTrackingId, this.isDevEnv);
    }
}

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
    testVariant = getCookieValue(this.testName);
    // if not...
    if (testVariant === undefined || testVariant === null) {
        /*
         * Determine if the user should be in the test group by generating
         * a random number, and see if that number * 100 is less than
         * the sample size. The larger the sample size, the more likely
         * the user will be in the test group.
         *
         * The min generated value is 0, and 0 < 0 == false, meaning a 0
         * sample size results in always false for test variant (all control
         * group).
         *
         * The max generated value is 99.99..., and 99.99... < 100 == true.
         * Meaning a 100 sample size value results in always true for test
         * variant (none in control group).
         */
        testVariant = (Math.random() * 100) < this.sample;

        // remember this value for later
        createCookie(this.testName, testVariant);
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
        hideElement("mv-control");
        // and show the test
        showElement("mv-test")
    } else {
        // else, show the control
        showElement("mv-control")
        // and hide the test
        hideElement("mv-test");
    }
};

/* ============================ *
 * Multivariate Private Methods *
 * ============================ */

/**
 * Hides an element specified by the passed in class name
 * 
 * @param  {String} className The class name of the element to hide
 */
var hideElement = function(className) {
    var elementsToHide, i;

    elementsToHide = document.getElementsByClassName(className);
    for (i=0; i<elementsToHide.length; i++) {
        console.log("hiding element: " + elementsToHide[i]);
        elementsToHide[i].style.display = "none";
    }
};

/**
 * Shows an element specified by the passed in class name
 * 
 * @param  {String} className The class name of the element to show
 */
var showElement = function(className) {
    var elementsToShow;

    elementsToShow = document.getElementsByClassName(className);
    for (i=0; i<elementsToShow.length; i++) {
        console.log("showing element: " + elementsToShow[i]);
        elementsToShow[i].style.display = "";
    }
};

var createCookie = function(cookieName, cookieValue) {
    document.cookie = cookieName + "=" + cookieValue;
};

var getCookieValue = function(cookieName) {
    var cookies;

    cookies = getCookies();
    cookies.forEach(function(cookie) {
        var cookieNV;

        cookieNV = cookie.split("=");
        if ((cookieNV.length > 1) && (cookieNV[0] === cookieName)) {
            return cookieNV[1];
        }
    });

    return null;
};

var getCookies = function() {
    var cookies, i;

    cookies = document.cookie.split(";");
    for (i=0; i<cookies.length; i++) {
        cookies[i] = cookies[i].trim();
    }

    return cookies;
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
