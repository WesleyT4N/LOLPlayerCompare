var myApp = angular.module('myFirstApp', []);
myApp.controller('myController', function($scope) {

    $scope.firstName = 'Trainee';
    $scope.lastName = 'Russo';

    $scope.printName = function() {
       return $scope.firstName + ' ' + $scope.lastName;
    }

    $scope.reversePrint = function() {
      var s = $scope.printName();
      return s.split("").reverse().join("");
    }
} );
