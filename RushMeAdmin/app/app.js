// File: app.js
// Description: Handler for routing and presentation related to the public page views of this single-page application

// Initial Declarations
var app = angular.module('RushMePublicControllers', ['ngRoute']);

app.config(function ($routeProvider, $locationProvider) {
    $routeProvider
    .when('/', {
      templateUrl: '/views/partials/home.html'
    })
    .when('/bye', {
      templateUrl: '/views/partials/bye.html'
    })
<<<<<<< HEAD
    .when('/privacy', {
      templateUrl: '/views/partials/privacy.html'
    })
=======
    // .when('/fraternities', {
    //   templateUrl: '/views/partials/fraternities.html'
    // })
>>>>>>> c11e4ebe0d7a401d43ec42b261fa8a26cc7db04e
    // /*
    // Replace templateURL with the path to the partial file
    // .when('/XXXXXX', {
    //   templateUrl: 'views/partials/XXXXXX.html',
    //   controller: 'XXXXXXCtrl'
    // })
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
  angular.bootstrap(document, ['RushMePublicControllers']);
});

require('dotenv').config();
