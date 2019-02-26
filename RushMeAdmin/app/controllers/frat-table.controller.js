// File: frat-table.controller.js	
// Description: frat-table controller that will handle all logic for the frat-table.html page	

 angular.module('RushMeAdminControllers').controller('FratTableCtrl', ['$scope', '$http', function ($scope, $http) {  	
  $scope.fraternaties = [];
  
  $http.get("/in/fraternaties/").then(
    function(res){
      $scope.fraternaties = res.data;
    },
    function(err){
      //Do something with the error here
      console.log("ERR: " + err);
    });
  
}]);
