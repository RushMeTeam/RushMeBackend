// File: event-table.controller.js	
// Description: event-table controller that will handle all logic for the event-table.html page	
// currEvents
angular
  .module('RushMeAdminControllers')
  .controller('EventTableCtrl',
    ['$scope', '$http', '$rootScope', function ($scope, $http, $rootScope) {
      $scope.events = [];
      $scope.editing = false;
      $scope.selected = -1;
      $scope.newEvent = {};
      $scope.currEvents = [];
      $scope.days = [];
      $scope.dayIdx = 0;
      $http.get("/in/events/").then(
        function (res) {
          res.data.map(function (event) {
            event.starts = new Date(event.starts);
            event.ends = new Date(event.ends);
          });
          // res.data.array.forEach(event => {
          //   let added = false;
          //   for (let i = 0; !added && i < $scope.events.length; i++) {
          //     let today = $scope.events[i][0].starts;
          //     if (sameDay(today, event.starts)) {
          //       $scope.events[i].push(event);
          //       added = true;
          //     }
          //   }
          //   if (!added) {
          //     $scope.events.push([event]);
          //   }
          // });
          res.data.forEach(event => {
            let key = event.starts.toLocaleString().split(',')[0];
            if (!(key in $scope.events)) {
              $scope.events[key] = [];
              $scope.days.push(key);
            }
            $scope.events[key].push(event);
          });
          $scope.dayIdx = 0;
          $scope.update();

        },
        function (err) {
          //Do something with the error here
          console.log("ERR: " + err);
        });

      let sameDay = function sameDay(d1, d2) {
        return d1.getFullYear() === d2.getFullYear() &&
          d1.getMonth() === d2.getMonth() &&
          d1.getDate() === d2.getDate();
      };
      $scope.update = function () {
        $scope.currEvents = $scope.events[$scope.days[$scope.dayIdx]];
        $scope.todayString = $scope.days[$scope.dayIdx];
      }
      $scope.next = function () {
        $scope.dayIdx += $scope.dayIdx < $scope.days.length - 1;
        $scope.update();
      }
      $scope.prev = function () {
        $scope.dayIdx -= $scope.dayIdx > 0;
        $scope.update();
      }
      $scope.editEvent = function (index) {
        $scope.selected = index;
        $scope.editing = true;
      }

      $scope.saveEditEvent = function () {
        let currentEvent = $scope.currEvents[$scope.selected];
        $http.post('/in/events/' + currentEvent.FraternityID + '/' + currentEvent.EventID, currentEvent);
        $scope.selected = -1;
      }

      $scope.saveNewEvent = function () {
        let newEvent = $scope.newEvent;
        newEvent.EventID = newEvent.FraternityID + ":" + newEvent.event_name;
        $http.post('/in/events/' + newEvent.FraternityID + '/' + newEvent.EventID, newEvent);
        let key = event.starts.toLocaleString().split(',')[0];
        if (!(key in $scope.events)) {
          $scope.events[key] = [];
          $scope.days.push(key);
        }
        $scope.events[key].push(event);
        $scope.newEvent = {};
      }

      $scope.deleteEvent = function () {
        let currentEvent = $scope.currEvents[$scope.selected];
        $http.delete('/in/events/' + currentEvent.FraternityID + '/' + currentEvent.EventID);
        $scope.currEvents.splice($scope.selected, 1);
        $scope.selected = -1;
      }

    }]);