// File: start.controller.js
// Description: Start controller that will handle all logic for the start.html page
"use strict";

var loginModule = angular.module('RushMeAdminControllers').controller('PortalCtrl', ['$scope', '$http', function ($scope, $http , $cookies) {
    // $scope.visible = true;
    $http({
        method: "GET",
        url: "/portal",
        headers: {
            accesstoken: $cookies.get("ClientAccessToken")
            }
        }).then(
        function success(response) {
            //Authenticated. Do something with the response.
            console.log("Hell yeah");
        },
        function error(err) {
            console.error(err);
        }
    );
}]);
