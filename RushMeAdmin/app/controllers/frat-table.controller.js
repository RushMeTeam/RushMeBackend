// File: frat-table.controller.js	
// Description: frat-table controller that will handle all logic for the frat-table.html page	

 angular
 .module('RushMeAdminControllers')
 .controller('FratTableCtrl', 
 ['$scope', '$http', '$rootScope', function ($scope, $http, $rootScope) {  	
  $rootScope.fraternities = [];
  $scope.selected = -1;
  $scope.newFrat = {};
  
  $http.get("/in/fraternities/").then(
    function(res){
      $rootScope.fraternities = res.data;
    },
    function(err){
      //Do something with the error here
      console.log("ERR: " + err);
    });
    
  $scope.editFrat = function(index){
    $scope.selected = index;
  }
  
  $scope.saveEditFrat = function(){
    let currentFrat = $rootScope.fraternities[$scope.selected];
    $http.post('/in/fraternities/' + currentFrat.namekey, currentFrat);
    $scope.selected = -1;
  }
  
  $scope.saveNewFrat = function(){
    let newFrat = $scope.newFrat;
    $http.post('/in/fraternities/' + newFrat.namekey, newFrat);
    $rootScope.fraternities.push(newFrat);
    $scope.newFrat = {};
  }
  
  $scope.deleteFrat = function(){
    let currentFrat = $rootScope.fraternities[$scope.selected];
    $http.delete('/in/fraternities/' + currentFrat.namekey);
    $rootScope.fraternities.splice($scope.selected, 1);
    $scope.selected = -1;
  }
  
}]);
