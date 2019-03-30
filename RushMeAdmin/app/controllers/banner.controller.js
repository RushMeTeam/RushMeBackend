// File: frat-table.controller.js	
// Description: frat-table controller that will handle all logic for the frat-table.html page	

angular.module('RushMeAdminControllers').controller('BannerCtrl', ['$scope', '$http', function ($scope, $http) {
  $scope.email;
  $scope.groups;
  $scope.username;
  $scope.display_group;
  $scope.committee;
  $scope.toDelete = [];
  $http.get("/in/users/current/").then(
    function (res) {
      $scope.email = res.data.email;
      $scope.username = res.data.sub;
      $scope.display_group = res.data['custom:group']|| "None";
      // If the connection between the car and the grandfather
      // could be stronger

    },
    function (err) {
      //Do something with the error here
      console.log("ERR: " + err);
    });
  $http.get("/in/users/current/committee/").then(
    function (res) {
      $scope.committee = res.data;
    },
    function (err) {
      //Do something with the error here
      console.log("ERR: " + err);
    });
  $scope.addRow = function() {
    if ($scope.committee.length < 10)
        $scope.committee.push({});
  }
  $scope.setGroup = function() {
    $http.post('/in/users/' + $scope.username + '/setgroup/IFC');
  }
  $scope.editMade = function(index) {
    console.log("Edit made on row " + (index+1));
  }
  $scope.saveEditCommittee = function () {
    console.log("Submission attempted");
  };
  $scope.deleteUser = function(index) {
    console.log("Want to delete user at row " + (index+1));
    if (!("email" in $scope.committee[index])) {
      $scope.committee.splice(index, 1);
    } else if (("toDelete" in $scope.committee[index])) {
      // REDO

    } else {
      // Delete
      $scope.toDelete.push($scope.committee[index]);
      // $scope.committee[index].username.strike();
    }


  }
  //http://localhost/in/users/signup/kuniha@rpi.edu/Community/IFC
  $scope.signup = function (email, scope, group) {
    $http.post('/in/users.signup/' + email + '/' + scope + '/' + group);
  };
}]);

$(document).ready(function () {
  let counter = 0;
  $("#addrow").on("click", function () {
    let newRow = $("<tr>");
    let cols = "";
    let editFrat = 'ng-click="editFrat($index)';
    cols += '<td><input id="name' + counter + '" type="text" class="form-control text-center no-border" placeholder="Name"/></td>';
    cols += '<td><input id="email' + counter + '" type="text" class="form-control text-center no-border" placeholder="Email"/></td>';
    cols += '<td><button id="delete' + counter + '" class="userDelBtn btn btn-md btn-link-danger "><i class="material-icons" style="color:red;">remove</i></button></td>';

    newRow.append(cols);
    $("table.order-list").append(newRow);
    counter++;
  });
  $("table.order-list").on("click", ".userDelBtn", function (event) {
    $(this).closest("tr").remove();
    counter -= 1
  });
});