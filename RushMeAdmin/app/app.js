// File: app.js
// Description: Handler for routing and presentation related to the page views of this single-page application

// Initial Declarations
var app = angular.module('RushMeAdminControllers', ['ngRoute']);

// The View Configuration (pseudo-URL work)
app.config(function ($routeProvider, $locationProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'views/partials/layout.html',
        controller: 'LayoutCtrl'
    })
    .when('/bye', {
      templateUrl: 'views/partials/bye.html',
    })
    .when('/error', {
      templateUrl: 'views/partials/error.html',
    })
    // .when('/login', {
    //   templateURL: "https://auth.rushme.app/login?response_type=code&client_id=4o9r7dvj3kiislsbh4cbhkf42&redirect_uri=https://rushme.app/"
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
    });
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
