# multivariate #

A client side JavaScript multivariate (A/B test) library.  Multivariate helps you
define a test along with the sample size of your audience the test will be run
against, and then execute your test.  If the user is selected to be within the test
they will see the test content.  If not, the user will see the control (or original)
content.  Google Analytics support is built in by providing a Google Analytics
Tracking ID.  (Note that this library uses the [Universal Analytics version of Google
Analytics](https://developers.google.com/analytics/devguides/collection/analyticsjs/)).
