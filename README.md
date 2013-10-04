# multivariate #

A client side JavaScript multivariate (A/B test) library.  Multivariate helps you
define a test (along with the sample size of your audience the test will be run
against), and then execute your test. When users view your website, multivariate
will assign them to either the test or control group and display the corresponding
test or control elements of the page to the user. Google Analytics support is built
into multivariate to allow you to track aspects of your test (how many users saw
the test vs control content, how many interacted with the page, etc). Note that
multivariate uses the [Universal Analytics version of Google Analytics](https://developers.google.com/analytics/devguides/collection/analyticsjs/).

## Quick Start ##

A/B web tests are intended to display one page to the control group and a
separate (though similar) page to the test group. To begin using multivariate
to create an A/B test, first decide which element(s) you wish to toggle between
the control and test groups. Then assign the <code>mv-control</code> and
<code>mv-test</code> classes to these elements.  For example:

```HTML
<!-- This will be displayed to the control group -->
<button class="mv-control">Submit</button>

<!-- This will be displayed to the test group -->
<button class="mv-test">Press Here To Complete</button>
```

When users in the control group are shown the page, they will see the elements
with the <code>mv-control</code> class displayed (and not test elements).
Similarly, when users in the test group view the page, they will see elements
with the <code>mv-test</code> class displayed (and not control elements).

To configure multivariate so this behavior takes place, include the multivariate
library on your page, and configure multivariate:

```JavaScript
// create a new multivariate test
var mv = new Multivariate("submit-button-test");

// execute the A/B test
mv.runTest();
```

Instantiate a new multivariate object for each test you wish to run. Each test
requires a unique name which is used when remembering which user is in which test.
Once instantiated, execute <code>runTest()</code> to run the A/B test on the user.
Calling this function will toggle either the control or test content based on which
cohort the user falls within.

## Demo Application ##

A demo application is available to better showcase the use of multivariate. Please
see the [multivariate-demo](https://github.com/DylanTS/multivariate-demo) for more
information.

## Multivariate Configuration ##

Several configuration options are available when instantiating the multivariate test
for your page. The multivariate constructor has the following signature:

<code>function Multivariate(testName, options)</code>

### testName ###

The multivariate constructor takes in one required argument, <code>testName</code>,
which is a String containing a unique name for your test. Since this is used within
a cookie to track users, please choose a name for the test that is a valid URL
encoded value (no semi-colon, comma, or white space).

### options ###

The multivariate constructor takes a single options parameter which can contain any
of the following parameters:

<ul>
<li><code>sample</code> : The size of your audience you wish to participate in
this test, from 0 to 1. For example, if you wanted to run this test on half your
users, pass in 0.5. For 75% pass in 0.75. If not supplied, this defaults to 0.5
(50%).</li>
<li><code>gaTrackingId</code> : If Google Analytics is desired, the Google Analytics
tracking ID must be supplied. This String is usually of the form "UA-XXXX-Y".
By supplying this value you enable Google Analytics for multivariate test pages.</li>
<li><code>isDevEnv</code> : If Google Analytics is enabled, this boolean is used
to determine if we're running in the development environment (meaning on
"localhost"). Google Analytics creates a cookie and needs to know the domain does
not exist if running on localhost. This defaults to false if not supplied.</li>
</ul>