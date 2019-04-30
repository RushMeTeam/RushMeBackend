// File: banner.controller.js
// Description: banner controller that will handle all logic for the banner.html and banner-portal.html pages

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
      $scope.display_group = res.data.display_group;
      if (!$scope.display_group) {
        $scope.display_group = "No Group";
      }
    },
    function (err) {
      //Do something with the error here
      console.log("ERR: " + err);
    });
  $http.get("/in/users/current/group/").then(
    function (res) {
      $scope.committee = res.data;
      $scope.size = res.data.length;
      $scope.added = [];
      $scope.deleted = [];
    },
    function (err) {
      console.log("ERR: " + err);
    });



  $scope.addRow = function () {
    if ($scope.added.length + $scope.committee.length > 10)
      return;
    $scope.added.push({ email: "", username: "" });
  }
  $scope.editUser = function (index) {
    let invalid = $scope.committee[index].email == $scope.email;
    if (invalid) { }
  }

  $scope.saveEditCommittee = function () {
    // for (let i = 0; i < oldAdded.length; i++) {
    //   let m = oldAdded[i];
    let promises = [];
    while ($scope.added.length > 0) {
      let m = $scope.added.pop();
      if (m.email) {
        console.log("hi added " + $scope.added.length);
        promises.push(new Promise((resolve, reject) => {
          $http.post('/in/users/setgroup/Community/' + m.email).then(
            res => {
              console.log(res);
              resolve();
            },
            msg => {
              console.log(msg);
              reject(msg);
            })
        }));
      }
    }
    while ($scope.deleted.length > 0) {
      promises.push(new Promise((resolve, reject) => {
        $http.post('/in/users/removefromgroup/Community/' + $scope.deleted.pop().email)
          .then(
            res => { 
              console.log(res);
              resolve(); 
            },
            msg => { 
              console.log(msg);
              reject(msg); 
            }
          )
      }));
    }

    Promise.all(promises)
      .then($http.get("/in/users/current/group/"))
      .then(
        function (res) {
          console.log("Got new committee!");
          if (!res) {
            console.log("No res!");
            console.log("Added: " + $scope.added);
            console.log("Deleted: " + $scope.deleted);
            return;
          } else if (!res.data) {
            console.log("No data!");
            console.log(res);
            return;
          }
          $scope.added = [];
          $scope.deleted = [];
          $scope.committee = res.data || [];
          $scope.size = $scope.committee.length;
        },
        function (err) { console.log("ERR: " + err); });
  }
  $scope.removeRow = function (index) {
    $scope.added.splice(index, 1);
  }
  $scope.restoreUser = function (index) {
    $scope.deleted.splice(index, 1);
  }
  $scope.deleteUser = function (member) {
    $scope.deleted.push(member);
  }
}]);

  // let isMember = index < $scope.size;
  // if (!isMember) {
  //   // REMOVE 
  //   $scope.committee.splice($scope.committee[index], $scope.committee[index]);
  // } else if (!$scope.deleted.includes(user)) {
  //   // REDO
  //   $scope.deleted.splice($scope.committee[index], $scope.committee[index]);
  // } else {
  //   // Delete
  //   $scope.deleted.push($scope.committee[index]);
  //   // $scope.committee[index].username.strike();
  // }
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
} */


// $(document).ready(function () {
//   let counter = 0;
//   $("#addrow").on("click", function () {
//     let newRow = $("<tr>");
//     let cols = "";
//     let editFrat = 'ng-click="editFrat($index)';
//     cols += '<td><input id="name' + counter + '" type="text" class="form-control text-center no-border" placeholder="Name"/></td>';
//     cols += '<td><input id="email' + counter + '" type="text" class="form-control text-center no-border" placeholder="Email"/></td>';
//     cols += '<td><button id="delete' + counter + '" class="userDelBtn btn btn-md btn-link-danger "><i class="material-icons" style="color:red;">remove</i></button></td>';

//     newRow.append(cols);
//     $("table.order-list").append(newRow);
//     counter++;
//   });
//   $("table.order-list").on("click", ".userDelBtn", function (event) {
//     $(this).closest("tr").remove();
//     counter -= 1
//   });
// });
