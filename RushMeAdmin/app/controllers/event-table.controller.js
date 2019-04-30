// File: event-table.controller.js	
// Description: event-table controller that will handle all logic for the event-table.html page	

 angular
 .module('RushMeAdminControllers')
 .controller('EventTableCtrl', 
 ['$scope', '$http', '$rootScope', function ($scope, $http, $rootScope) {
  $scope.events = [];
  $scope.editing = false;
  $scope.selected = -1;
  $scope.newEvent = {};
  
  $http.get("/in/events/").then(
    function(res){
      res.data.map(function(event){
        event.starts = new Date(event.starts);
        event.ends = new Date(event.ends);
      });
      $scope.events = res.data;
    },
    function(err){
      //Do something with the error here
      console.log("ERR: " + err);
    });
  
  $scope.editEvent = function(index){
    $scope.selected = index;
    $scope.editing = true;
  }
  
  $scope.saveEditEvent = function(){
    let currentEvent = $scope.events[$scope.selected];
    $http.post('/in/events/' + currentEvent.FraternityID + '/' + currentEvent.EventID, currentEvent);
    $scope.selected = -1;
  }
  
  $scope.saveNewEvent = function(){
    let newEvent = $scope.newEvent;
    newEvent.EventID = newEvent.FraternityID + ":" + newEvent.event_name;
    $http.post('/in/events/' + newEvent.FraternityID + '/' + newEvent.EventID, newEvent);
    $scope.events.push(newEvent);
    $scope.newEvent = {};
  }
  
  $scope.deleteEvent = function(){
    let currentEvent = $scope.events[$scope.selected];
    $http.delete('/in/events/' + currentEvent.FraternityID + '/' + currentEvent.EventID);
    $scope.events.splice($scope.selected, 1);
    $scope.selected = -1;
  }
}]);