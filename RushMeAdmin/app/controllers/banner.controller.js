// File: frat-table.controller.js	
// Description: frat-table controller that will handle all logic for the frat-table.html page	

angular.module('RushMeAdminControllers').controller('BannerCtrl', ['$scope', '$http', function ($scope, $http) {
  $scope.email;
  $scope.groups;
  $scope.username;
  $scope.display_group;
  $scope.committee;
  $scope.size;
  $scope.deleted = [];
  $scope.added = [];
  $scope.edited = [];
  $http.get("/in/users/current/").then(
    function (res) {
      $scope.email = res.data.email;
      $scope.username = res.data.sub;
      if ('custom:group' in res.data) {
        $scope.display_group = res.data['custom:group'];
      } else {
        $scope.display_group = "No Group";
      }
      
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
      $scope.size = res.data.length;
    },
    function (err) {
      //Do something with the error here
      console.log("ERR: " + err);
    });
  $scope.addRow = function() {
    if ($scope.added.length  + $scope.committee.length > 10)
        return;
    $scope.committee.push({});
  }
  $scope.setGroup = function() {
    $http.post('/in/users/' + $scope.username + '/setgroup/IFC');
  }
  $scope.editUser = function(index) {
    let user = $scope.committee[index];
    let isMember = !(user in $scope.added);
    if (isMember) {
      console.log("Edit made on row " + (index+1) + ": " + $scope.committee[index].email + " " + $scope.committee[index].username);
      let user = $scope.committee[index];
    } else {
      $scope.added[index] = user;
    }
  }
  $scope.saveEditCommittee = function () {
    console.log("Submission attempted");
    $scope.committee.forEach(member => {
      $http.post('/in/users/signup/Contrubutor/IFC/' + member.email );
    });
  
  };
  $scope.deleteUser = function(index) {
    let user = $scope.committee[index];
    let isMember = index < $scope.size;
    if (!isMember) {
      $scope.committee.pop();
    } else if (!$scope.deleted.includes(user)) {
      // REDO
      $scope.deleted.splice($scope.committee[index], $scope.committee[index]);
    } else {
      // Delete
      $scope.deleted.push($scope.committee[index]);
      // $scope.committee[index].username.strike();
    }
    /*
    console.log("Want to delete user at row " + (index+1));
    if (!("email" in $scope.committee[index])) {
      $scope.committee.splice(index, 1);
    } else if (("toDelete" in $scope.committee[index])) {
      // REDO
      $scope.toDelete.remove($scope.committee[index]);
    } else {
      // Delete
      $scope.toDelete.push($scope.committee[index]);
      // $scope.committee[index].username.strike();
    }
*/

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