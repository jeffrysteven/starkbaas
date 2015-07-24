angular.module('stk.main',['ui.router','mainServices'])
.config(function config( $stateProvider ) {
  $stateProvider.state('/', {
    url: '/',
    views: {
      "main": {
        controller: 'MainCtrl',
        templateUrl: 'partials/dashboard/main'
      }
    },
    data:{ pageTitle: 'Dashboard' }
  })
})
.run( function run ($localStorage, $rootScope, $location) {
  if (typeof $localStorage.token === 'undefined') {
    //$rootScope.$apply(function() { $location.path('/login') });
    $location.path('/login');
  }
})
.controller( 'MainCtrl', function MainCtrl($scope, $location, mainFactory, $stateParams, $localStorage) {
  $scope.rowCollection = [];
  $scope.displayedCollection = [];
  var menu = mainFactory.menu();
  menu.success(function(data, status, headers, config) {
    $scope.menus = data.data.permissions;
    $scope.user = data.data.user;
    /*console.log($scope.menus);
    console.log($scope.user);*/
  }).
  error(function(data, status, headers, config) {
    console.log('Error: ' + data);
  });
});