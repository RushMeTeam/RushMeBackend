

angular.module('RushMePublicControllers').controller('FratCardCtrl', ['$scope', '$http', function ($scope, $http) {  	
    $scope.fraternities = [];
    $scope.rootURL = "s3.us-east-2.amazonaws.com/rushmepublic";
  // Using cors.io is suspicious!
    $http.get('https://cors.io/?https://s3.us-east-2.amazonaws.com/rushmepublic/fraternites.rushme').then(
      function(res){
        $scope.fraternities = res.data;
      },
      function(err){
        //Do something with the error here
        console.log("ERR: " + err);
      });
    
  }]);