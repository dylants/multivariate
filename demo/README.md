# multivariate demo #

A demo of the multivariate library, showcasing an example use of multivariate through a mock A/B test. The use of Google Analytics through multivariate is also demonstrated.

## Overview ##

This demo Node application has a single index page, which displays something different depending on if the user viewing the page is in the test group or the control group. The [multivariate library](https://github.com/dylants/multivariate) is used to toggle between the two views. If the user is in the control group, a blue button is displayed, and if in the test group, a green button is displayed. Google Analytics is also utilized to gather data on which view is displayed and if the user clicks on the button that is displayed.

## Running the Demo ##

To run the demo, you must first clone the multivariate repository to your local machine. The demo is a Node.js application, so Node is required. For more information on installing Node please see the [Node website](http://nodejs.org/).

### Install Dependencies ###

Once the repository is downloaded and Node is setup, install the server-side project dependencies for the demo by running <code>npm install</code> from the command line from within this "demo" directory. This will download all server-side project dependencies. For client side, multivariate is required and can be installed using [bower](http://bower.io/) or copying from the parent directory. To install using bower, from within the "demo" directory, execute the command <code>bower install multivariate</code>.

### (Optional) Setup Google Analytics ###

This demo uses Google Analytics to track page views. However, the Google Analytics Tracking ID is not specified in the code, but instead read from an environment variable. Export the environment variable <code>GA_TRACKING_ID</code> set to the Google Analytics Tracking ID you wish to use, prior to starting up the application. If one is not available, the Google Analytics portion will be skipped.

### Start the Demo ###

To start the application, execute <code>npm start</code> from this "demo" directory. Then navigate to [http://localhost:3000/](http://localhost:3000/) to view the test page. By viewing this page, you will be selected into either the control or test group, and shown either the control or test content respectively.

## Understanding Multivariate Further ##

[View the source of the index.html page](https://github.com/dylants/multivariate/blob/master/demo/views/index.html) to better understand how to use multivariate. The page has script included only the multivariate library, no other libraries are necessary. The application's code is found between the &lt;script&gt; tags in the index.html source.

For more information on multivariate, see the main [multivariate GitHub page](https://github.com/dylants/multivariate).
