// File: frat-table.controller.js	
// Description: frat-table controller that will handle all logic for the frat-table.html page	

 app.controller('FratTableCtrl', ['$scope', '$http',
            function ($scope, $http) {  	
              $scope.fraternities = [];
              $http.get("/in/fraternities/").then(
                function(res){
                  $scope.fraternities = res.data;
                },
                function(err){
                  //Do something with the error here
                  console.log("ERR: " + err);
                });
              $scope.open = function() {
                document.getElementById('fratDetail').focus();
              }
              }]);
          