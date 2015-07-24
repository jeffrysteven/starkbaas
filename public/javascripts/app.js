angular.module('stkbackend', ['ui.bootstrap', 'smart-table', 'ui.router', 'ngStorage', 'stk.authentication', 'stk.main', 'stk.object'])
.config( function stkbackendConfig ( $stateProvider, $urlRouterProvider, $httpProvider) {
  $urlRouterProvider.otherwise( '/' );
  $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function($q, $location, $localStorage) {
        return {
            'request': function (config) {
              config.headers = config.headers || {};
              if ($localStorage.token) {
                  config.headers.Authorization =  $localStorage.token;
              }
              return config;
            },
            'responseError': function(response) {
                if(response.status === 401 || response.status === 403) {
                    $location.path('/login');
                }
                return $q.reject(response);
            }
        };
	}]);
})
.run( function run () {
})
.controller( 'AppCtrl', function AppCtrl ( $scope, $location ) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle ;
    }
  });
});