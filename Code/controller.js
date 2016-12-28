angular.module('DemoApp').controller('ParentCtrl', function() {
  var Prt = this;
  Prt.name = 'John';
}]).controller('SonCtrl', function() {
  var Son = this;
  Son.name = 'Sam';
}])
