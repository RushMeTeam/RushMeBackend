// File: app.js
// Description: Handler for routing and presentation related to the page views of this single-page application

// Initial Declarations
var app = angular.module('RushMeAdminControllers', ['ngRoute']);

const poolData = {
    UserPoolId : "us-east-1_hp56TBp7o",
    ClientId : "4o9r7dvj3kiislsbh4cbhkf42"
};
// var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);


const poolRegion = "us-east-1";
// The View Configuration (pseudo-URL work)
app.config(function ($routeProvider, $locationProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'views/partials/home.html',
    })
    .when('/bye', {
      templateUrl: 'views/partials/bye.html',
    })
    .when('/error', {
      templateUrl: 'views/partials/error.html',
    })
    .when('/dashboard', {
      templateUrl: 'views/partials/portal.html',

    })
    // .when('/login', {
    //   // redirectTo:
    //   // controller: 'LoginCtrl'
    // })
    .when('/logout', {
      redirectTo:"/bye"
    })
    // .when('/portal', {
    //   // var user = userPool.getCurrentUser();
    //   // user.signOut()
    //   templateUrl: 'views/partials/portal.html',
    //   controller: 'PortalCtrl'
    //
    // })
    // .when('/portal/:userid', function(req, res) {
    //
    // })
    /*
    Replace templateURL with the path to the partial file
    .when('/XXXXXX', {
        templateUrl: 'views/partials/XXXXXX.html',
        controller: 'XXXXXXCtrl'
    })
    */
    .otherwise({
        redirectTo: "/"
    })
});

app.config(function($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
  // Allow same origin resource loads.
  'self',
  // Allow loading from our assets domain.  Notice the difference between * and **.
  'https://auth.rushme.app/**'
  ]);
  $sceDelegateProvider.resourceUrlBlacklist([
  ]);
});

angular.element(function() {
    angular.bootstrap(document, ['RushMeAdminControllers']);
});
