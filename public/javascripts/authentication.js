angular.module('stk.authentication',['ui.router','authenticationServices'])
.config(function config( $stateProvider ) {
  $stateProvider.state( '/login', {
    url: '/login',
    views: {
      "main": {
        controller: 'AuthenticationCtrl',
        templateUrl: 'partialsfree/auth/login'
      }
    },
    data:{ pageTitle: 'Iniciar Sesión' }
  })
  .state('/register', {
    url: '/register',
    views: {
      "main": {
        controller: 'AuthenticationCtrl',
        templateUrl: 'partials/auth/register'
      }
    },
    data:{ pageTitle: 'Registro' }
  })
  .state('/forgot', {
    url: '/forgot',
    views: {
      "main": {
        controller: 'AuthenticationCtrl',
        templateUrl: 'partials/auth/forgot'
      }
    },
    data:{ pageTitle: 'Recuperar Contraseña' }
  })
})
.run( function run ($localStorage, $rootScope, $location) {
  if (typeof $localStorage.token !== 'undefined') {
    $location.path('dashboard');
  }
})
.controller( 'AuthenticationCtrl', function AuthenticationCtrl( $rootScope, $scope, $location, authenticationFactory, $stateParams, $localStorage) {
  $scope.rowCollection = [];
  $scope.displayedCollection = [];
  $scope.auth = function () {
    var userData = $scope.user;
    var data = authenticationFactory.auth(angular.toJson(userData));
    data.
    success(function(data, status, headers, config) {
      if (status === 200) {
        $localStorage.token = data.token;
      };
      setTimeout(function(){
        window.location = "dashboard";
      },1500);
    }).
    error(function(data, status, headers, config) {
      console.log('Error: ' + data);
    });
  },
  $scope.register = function () {
    var userData = $scope.user;
    var data = authenticationFactory.auth(angular.toJson(userData));
    data.
    success(function(data, status, headers, config) {
      setTimeout(function(){
        window.location = "/";
      },1500);
    }).
    error(function(data, status, headers, config) {
      console.log('Error: ' + data);
    });
  }
});