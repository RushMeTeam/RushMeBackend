// File: event-table.controller.js	
// Description: event-table controller that will handle all logic for the event-table.html page	

 angular.module('RushMeAdminControllers').controller('EventTableCtrl', ['$scope', '$http', function ($scope, $http) {  	
  $scope.events = [];
  
  $http.get("/in/events/").then(
    function(res){
      $scope.events = res.data;
    },
    function(err){
      //Do something with the error here
      console.log("ERR: " + err);
    });
  
}]);
