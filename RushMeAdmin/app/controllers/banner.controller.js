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


$(document).ready(function () {
  var counter = 0;

  $("#addrow").on("click", function () {
      var newRow = $("<tr>");
      var cols = "";

      cols += '<td><input type="text" class="form-control text-center no-border" placeholder="Name"' + counter + '"/></td>';
      cols += '<td><input type="text" class="form-control text-center no-border" placeholder="Email"' + counter + '"/></td>';
      cols += '<td><input type="button" class="ibtnDel btn btn-md btn-danger " value="Cancel"></td>';

      newRow.append(cols);
      $("table.order-list").append(newRow);
      counter++;
  });



  $("table.order-list").on("click", ".ibtnDel", function (event) {
      $(this).closest("tr").remove();       
      counter -= 1
  });


});