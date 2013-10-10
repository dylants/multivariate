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
        console.log("setting user to testVariant = " + testVariant);

        // remember this value for later
        createCookie(this.testName, testVariant);
    } else {
        // make sure to convert from string to boolean
        testVariant = (testVariant === "true");
        console.log("cookie found, user in testVariant: " + testVariant);
    }

    // remember for later
    this.isInTest = testVariant;

    return this.isInTest;
};

/**
 * Executes the A/B test. If the user is in the test group, show all
 * elements with class "mv-test", and hide all elements with class "mv-control".
 * If not, the opposite is done ("mv-control" is shown, "mv-test" hidden).
 *
 * Additionally, if Google Analytics support is enabled, this will send
 * a page view request to Google Analytics. To disable this feature, pass
 * in false to the function.
 *
 * @param {Boolean} sendPageView If Google Analytics support is enabled,
 *                               and this parameter is true (or not supplied),
 *                               this function will send a page view request
 *                               to Google Analytics. This parameter defaults
 *                               to true if not supplied.
 */
Multivariate.prototype.runTest = function(sendPageView) {
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

    // if Google Analytics support is enabled
    if (doesGAExist) {
        // if the sendPageView parameter was NOT supplied OR
        // the parameter is true
        if (sendPageView === undefined || sendPageView) {
            // send a page view request
            this.gaSendPageView();
        }
    }
};

/* =============================== *
 * Google Analytics Helper Methods *
 * =============================== */

/**
 * Sends Google Analytics a message to track this page
 */
Multivariate.prototype.gaSendPageView = function() {
    if (!doesGAExist()) {
        console.error("ga does not exist, will not send page view");
        return;
    }
    ga("send", "pageview");
};

/**
 * Sends Google Analytics a custom dimemsion name and value
 *
 * @param  {String} dimensionName  The custom dimension name
 * @param  {String} dimensionValue The custom dimension value
 */
Multivariate.prototype.gaSetDimension = function(dimensionName, dimensionValue) {
    if (!doesGAExist()) {
        console.error("ga does not exist, will not set dimension");
        return;
    }
    ga("set", dimensionName, dimensionValue);
};

/**
 * Binds a click event to send Google Analytics a custom event, with category
 * set to "button", action set to "click", and label set to the ID of the element.
 *
 * @param  {String} id The ID of the element to bind
 */
Multivariate.prototype.gaBindClickEvent = function(id) {
    if (!doesGAExist()) {
        console.error("ga does not exist, will not bind click event to send a " +
            "Google Analytics event");
        return;
    }
    bindEvent(document.getElementById(id), "click", function() {
        ga("send", "event", "button", "click", id);
    });
};

/* =============== *
 * Private Methods *
 * =============== */

/**
 * Hides an element specified by the passed in class name
 *
 * @param  {String} className The class name of the element to hide
 */
var hideElement = function(className) {
    var elementsToHide, i;

    elementsToHide = document.getElementsByClassName(className);
    for (i = 0; i < elementsToHide.length; i++) {
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
    for (i = 0; i < elementsToShow.length; i++) {
        console.log("showing element: " + elementsToShow[i]);
        elementsToShow[i].style.display = "";
    }
};

/**
 * Creates a single cookie
 * 
 * @param  {String} cookieName  The name of the cookie to set
 * @param  {String} cookieValue The value of the cookie to set
 */
var createCookie = function(cookieName, cookieValue) {
    console.log("setting cookie, cookieName: " + cookieName +
        " cookieValue: " + cookieValue);
    document.cookie = cookieName + "=" + cookieValue;
};

/**
 * Gets the value of a cookie
 * 
 * @param  {String} cookieName The name of the cookie to retrieve
 * @return {String}            The value of the cookie
 */
var getCookieValue = function(cookieName) {
    var cookies, i, cookieNV;

    cookies = getCookies();
    for (i = 0; i < cookies.length; i++) {
        cookieNV = cookies[i].split("=");
        if ((cookieNV.length > 1) && (cookieNV[0] === cookieName)) {
            console.log("found test cookie with value: " + cookieNV[1]);
            return cookieNV[1];
        }
    }

    return null;
};

/**
 * Returns all the cookies, split into an array and trimmed
 * 
 * @return {Array} The current cookies available
 */
var getCookies = function() {
    var cookies, i;

    cookies = document.cookie.split(";");
    for (i = 0; i < cookies.length; i++) {
        cookies[i] = cookies[i].trim();
    }

    return cookies;
};

/**
 * Binds an event to an element, with support for older browsers
 * 
 * @param  {Object} element         The element to bind to
 * @param  {String} eventName       The name of the event to add as a listener
 * @param  {Function} functionToRun The function to run when the event is triggered
 * @return {Object}                 The result of the attach/add event
 */
var bindEvent = function(element, eventName, functionToRun) {
    // detect if attach event is available (old IE)
    if (element.attachEvent) {
        return element.attachEvent("on" + eventName, functionToRun);
    } else {
        return element.addEventListener(eventName, functionToRun, false);
    }
};

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
 * Utility function to determine if the ga object exists
 *
 * @return {Boolean} true if ga exists, false otherwise
 */
var doesGAExist = function() {
    if (typeof ga !== "undefined") {
        return true;
    } else {
        return false;
    }
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
    if (!doesGAExist()) {
        console.error("ga does not exist, will not attempt to create GA tracker object");
        return;
    }

    if (isDevEnv) {
        // set cookieDomain to none to test on localhost
        ga("create", gaTrackingId, {
            "cookieDomain": "none"
        });
    } else {
        ga("create", gaTrackingId);
    }
};
