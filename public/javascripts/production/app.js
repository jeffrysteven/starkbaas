angular.module('production', ['ui.bootstrap', 'smart-table' ,'ui.router', 'production.proveedor', 'production.empresa', 'production.rol', 'production.colaborador', 'production.producto', 'production.productoProveedor', 'production.etapa', 'production.compra','ui.utils.masks'])
.config( function productionConfig ( $stateProvider, $urlRouterProvider ) {
  $urlRouterProvider.otherwise( '/home' );
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