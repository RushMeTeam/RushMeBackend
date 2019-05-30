// File: frat-table.controller.js	
// Description: frat-table controller that will handle all logic for the frat-table.html page	

 angular
 .module('RushMeAdminControllers')
 .controller('OrgTableCtrl', 
 ['$scope', '$http', '$rootScope', function ($scope, $http, $rootScope) {  	
  $rootScope.organizations = [];
  $scope.selected = -1;
  $scope.newOrgDetails = {};
  
  $http.get("/in/fraternities/").then(
    function(res){
      $rootScope.organizations = res.data;
    },
    function(err){
      //Do something with the error here
      console.log("ERR: " + err);
    });
    
  $scope.updateSelectedIndex = function(index){
    $scope.selected = index;
  }
  
  $scope.editOrg = function(){
    let currentOrg = $rootScope.organizations[$scope.selected];
    $http.post('/in/fraternities/' + currentOrg.namekey, currentOrg);
    $scope.selected = -1;
  }
  
  $scope.newOrg = function(){
    let newOrgDetails = $scope.newOrgDetails;
    $http.post('/in/fraternities/' + newOrgDetails.namekey, newOrgDetails);
    $rootScope.organizations.push(newOrgDetails);
    $scope.newOrgDetails = {};
  }
  
  $scope.deleteOrg = function(){
    let currentOrg = $rootScope.organizations[$scope.selected];
    $http.delete('/in/fraternities/' + currentOrg.namekey);
    $rootScope.organizations.splice($scope.selected, 1);
    $scope.selected = -1;
  }
  
}]);
