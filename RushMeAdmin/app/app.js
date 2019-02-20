// File: app.js
// Description: Handler for routing and presentation related to the page views of this single-page application

// Initial Declarations
var app = angular.module('RushMeAdminControllers', ['ngRoute']);

// The View Configuration (pseudo-URL work)
app.config(function ($routeProvider, $locationProvider) {
    $routeProvider
    .when('/', {
        templateUrl: '../views/partials/bye.html'
    })
    .when('/in/*', {
      redirectTo: '/in/dashboard'
    })
    .when('/bye', {
      templateUrl: '../views/partials/bye.html'
    })
    // /*
    // Replace templateURL with the path to the partial file
    // .when('/XXXXXX', {
    //     templateUrl: 'views/partials/XXXXXX.html',
    //     controller: 'XXXXXXCtrl'
    // })
    .otherwise({
        redirectTo: "/"
    })
});

app.controller("DashboardCtrl", function($scope, $http, $cookies) {
   $http({
       method: "GET",
       url: "/in/dashboard",
   }).then(
       function success(response) {
           //Authenticated. Do something with the response.
       },
       function error(err) {
           console.error(err);
       }
   );
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
