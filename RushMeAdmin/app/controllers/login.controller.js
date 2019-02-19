// File: start.controller.js
// Description: Start controller that will handle all logic for the start.html page

angular.module('RushMeAdminControllers').controller('LoginCtrl', ['$scope', '$http', function ($scope, $http) {
    $scope.visible = true;
}]);

const express = require('express')
, router = express.Router()
