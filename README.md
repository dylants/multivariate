# multivariate #

A client side JavaScript A/B test library. Multivariate helps you define a test, specify the sample size of your audience which should see the test, and collect data to verify if the test was successful. Support for Google Analytics is built into multivariate to allow you to track page views, custom metrics or dimensions, and user interaction through events. (Note that multivariate uses the [Universal Analytics version of Google Analytics](https://developers.google.com/analytics/devguides/collection/analyticsjs/).)

## Documentation ##

- [Tutorials and Guides](#tutorials-and-guides)
    - [Quick Start](#quick-start)
    - [Demo Application](#demo-application)
- [Multivariate Configuration](#multivariate-configuration)
    - [testName](#testname)
    - [options](#options)
- [Google Analytics](#google-analytics)
- [Multivariate API](#multivariate-api)
    - [runTest([sendPageView])](#runtestsendpageview)
    - [isInTestGroup()](#isintestgroup)
    - [gaSendPageView()](#gasendpageview)
    - [gaSetDimension(dimensionName, dimensionValue)](#gasetdimensiondimensionname-dimensionvalue)
    - [gaBindClickEvent(id)](#gabindclickeventid)
- [License](#license)

## Tutorials and Guides ##

### Quick Start ###

A/B web tests are intended to display one page to the control group and a separate, though similar, page to the test group. To begin using multivariate to create an A/B test, first decide which element(s) you wish to toggle between the control and test groups. Then assign the <code>mv-control</code> or <code>mv-test</code> class to these elements.  For example:

```HTML
<!-- This will be displayed to the control group -->
<button class="mv-control">Submit</button>

<!-- This will be displayed to the test group -->
<button class="mv-test">Press Here To Complete</button>
```

When users in the control group are shown the page, they will see the elements with the <code>mv-control</code> class displayed (and not test elements). Similarly, when users in the test group view the page, they will see elements with the <code>mv-test</code> class displayed (and not control elements).

To configure multivariate so this behavior takes place, include the multivariate library on your page, and configure multivariate:

```JavaScript
// create a new multivariate test
var mv = new Multivariate("submit-button-test");

// execute the A/B test
mv.runTest();
```

Instantiate a new multivariate object for each test you wish to run. Each test requires a unique name which is used when remembering which user is in which test. Once instantiated, execute <code>runTest()</code> to run the A/B test on the user. Calling this function will toggle either the control or test content based on which cohort the user falls within.

### Demo Application ###

A more complete example can be found in the [multivariate-demo application](https://github.com/dylants/multivariate-demo). This demo app has a sample test, along with support for Google Analytics. The full source code is available online at: [https://github.com/dylants/multivariate-demo](https://github.com/dylants/multivariate-demo)

## Multivariate Configuration ##

Several configuration options are available when instantiating the multivariate test for your page. The multivariate constructor has the following signature:

```JavaScript
function Multivariate(testName, options) { ... }
```

Below is an overview of the arguments available:

### testName ###

The multivariate constructor takes in one required argument, <code>testName</code>, which is a String containing a unique name for your test. Since this is used within a cookie to track users, please choose a name for the test that is a valid URL encoded value (no semi-colon, comma, or white space).

### options ###

The multivariate constructor takes a single options parameter which can contain any of the following parameters:

- <code>sample</code> :  The size of the audience you wish to participate in this A/B test, from 0 to 100. For example, if you want to run this test on half your users, pass in 50 to represent 50% sample size. For a 75% sample size, pass in 75. The default value is 50.
- <code>gaTrackingId</code> : If Google Analytics is desired, the Google Analytics tracking ID must be supplied. This String is usually of the form "UA-XXXX-Y". By supplying this value you enable Google Analytics for multivariate test pages. If this value is not supplied, Google Analytics support will be disabled.
- <code>isDevEnv</code> : If Google Analytics is enabled, this boolean is used to determine if we're running in the development environment (meaning on "localhost"). Google Analytics creates a cookie and needs to know the domain does not exist if running on localhost. The default value is false.
- <code>cookieExpireDays</code> : The number of days the cookie, which maps a user to a certain test, should persist in the user's browser. The default value is 90.
- <code>debug</code> : Enable sending debug information to the console. Defaults to false.

## Google Analytics ##

If the <code>gaTrackingId</code> is provided to the multivariate constructor, Google Analytics will be configured and setup on that page automatically. This means that the [JavaScript snippet specified on the Universal Analytics version of Google Analytics website](https://developers.google.com/analytics/devguides/collection/analyticsjs/) is not needed. Simply pass in the <code>gaTrackingId</code> and multivariate will execute the required code, setting up Google Analytics.

Multivariate also supplies some Google Analytics helper functions which can be useful when additional analytics support is desired. See the [Multivariate API](#multivariate-api) section of the documentation for more information.

## Multivariate API ##

Below is an overview of the public APIs available through multivariate:

### runTest([sendPageView])

Executes the A/B test. If the user is in the test group, show all elements with class "mv-test", and hide all elements with class "mv-control". If not, the opposite is done ("mv-control" is shown, "mv-test" hidden). Additionally, if Google Analytics support is enabled, this will send a page view request to Google Analytics. To disable this feature, pass in false to the function.

__Arguments__

* sendPageView - If Google Analytics support is enabled, and this parameter is true (or not supplied), this function will send a page view request to Google Analytics. This parameter defaults to true if not supplied.

---------------------------------------

### isInTestGroup()

Returns true if the current user is in the test group, false if the user is in the control group (not in test).

---------------------------------------

### gaSendPageView()

Sends Google Analytics a message to track this page. Note that this is called automatically when <code>runTest()</code> is called, if Google Analytics support is enabled.

---------------------------------------

### gaSetDimension(dimensionName, dimensionValue)

Sends Google Analytics a custom dimemsion name and value.

__Arguments__

* dimensionName - The custom dimension name
* dimensionValue - The custom dimension value

---------------------------------------

### gaBindClickEvent(id)

Binds a click event to send Google Analytics a custom event, with category set to "button", action set to "click", and label set to the ID of the element.

__Arguments__

* id - The ID of the element to bind

## License ##

[MIT](https://github.com/dylants/multivariate/blob/master/LICENSE)
