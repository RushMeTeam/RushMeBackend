// File: frat-table.controller.js	
// Description: frat-table controller that will handle all logic for the frat-table.html page	

 angular.module('RushMeAdminControllers').controller('BannerCtrl', ['$scope', '$http', function ($scope, $http) {  	
  $scope.email;
  $scope.groups;
  $scope.display_group;
  $scope.committee;
  $http.get("/in/users/current/").then(
    function(res){
      $scope.email = res.data.email;
    // If the connection between the car and the grandfather
      // could be stronger

    },
    function(err){
      //Do something with the error here
      console.log("ERR: " + err);
    });
    $http.get("/in/users/current/groups").then(
      function(res){
        $scope.display_group = res.data[0];
      // If the connection between the car and the grandfather
        // could be stronger
  
      },
      function(err){
        //Do something with the error here
        console.log("ERR: " + err);
      });
    $http.get("/in/users/current/committee/").then(
      function(res){
        $scope.committee = res.data;
      // If the connection between the car and the grandfather
        // could be stronger
  
      },
      function(err){
        //Do something with the error here
        console.log("ERR: " + err);
      });
  
    
  
  
}]);
