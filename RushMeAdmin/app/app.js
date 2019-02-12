// File: app.js
// Description: Handler for routing and presentation related to the page views of this single-page application

// Initial Declarations
var app = angular.module('RushMeAdminControllers', ['ngRoute']);

// The View Configuration (pseudo-URL work)
app.config(function ($routeProvider, $locationProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'views/partials/example.html',
        controller: 'ExampleCtrl'
    })
    .when('/sorry', {
        templateUrl: 'views/partials/sorry.html',
        //controller: 'SorryCtrl'
    })
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

angular.element(function() {
    angular.bootstrap(document, ['RushMeAdminControllers']);
});
