// File: frat-table.controller.js	
// Description: frat-table controller that will handle all logic for the frat-table.html page	

 angular.module('RushMeAdminControllers').controller('FratTableCtrl', ['$scope', '$http', function ($scope, $http) {  	
  $scope.fraternities = [];
  $scope.selected = -1;
  $scope.newFrat = {};
  
  $http.get("/in/fraternities/").then(
    function(res){
      $scope.fraternities = res.data;
    },
    function(err){
      //Do something with the error here
      console.log("ERR: " + err);
    });
    
  $scope.editFrat = function(index){
    $scope.selected = index;
  }
  
  $scope.saveEditFrat = function(){
    console.log($scope.newFrat);
    $http.post('/in/fraternities/' + $scope.newFrat.namekey, $scope.newFrat);
    $scope.fraternities.push($scope.newFrat);
    $scope.newFrat = {};
  }
  
}]);
