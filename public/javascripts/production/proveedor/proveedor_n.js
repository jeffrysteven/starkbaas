angular.module('production.proveedor',['ui.router','proveedorServices'])
.config(function config( $stateProvider ) {
  $stateProvider.state( 'proveedor/', {
    url: '/proveedor',
    views: {
      "main": {
        controller: 'ProveedorCtrl',
        templateUrl: 'partials/proveedores/proveedor'
      }
    },
    data:{ pageTitle: 'Proveedor' }
  })
  .state('proveedor/list', {
    url: '/proveedor/list',
    views: {
      "main": {
        controller: 'ProveedorCtrl',
        templateUrl: 'partials/proveedores/proveedor_list'
      }
    },
    data:{ pageTitle: 'Proveedor' }
  });
})
.controller( 'ProveedorCtrl', function ProveedorCtrl( $scope, proveedorFactory ) {
  $scope.rowCollection = [];
  $scope.displayedCollection = [];
  $scope.createProveedor = function () {
    var defaultProveedor = {
      nit: "",
      nombre: "",
      email: "",
      telefono: "",
      contacto: "",
      ciudad: "",
      direccion: ""
    };
    var proveedor = $scope.proveedor;
    var data = proveedorFactory.saveProveedor($.param(proveedor));
    data.
    success(function(data, status, headers, config) {
      $scope.proveedorForm.$setPristine();
      $scope.proveedor = defaultProveedor;
    }).
    error(function(data, status, headers, config) {
      console.log('Error: ' + data);
    });
    //console.log(proveedor);
    /****$http({
      method: 'POST',
      url: '/object/proveedor',
      data: $.param(proveedor),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).
    success(function(data, status, headers, config) {
      $scope.proveedorForm.$setPristine();
      $scope.proveedor = defaultProveedor;
      console.log(data);
    }).
    error(function(data, status, headers, config) {
      console.log('Error: ' + data);
    });****/


    /*success: function (data) {
        $scope.proveedorForm.$setPristine();
        $scope.proveedor = defaultProveedor;
        console.log('Success: '+data);
      },
      error: function (data) {
        console.log('Error: ' + data);
      }*/
  },
  $scope.getProveedores = function () {
    var data = proveedorFactory.getProveedores();
    data.
    success(function(data, status, headers, config) {
      $scope.rowCollection = data;
    }).
    error(function(data, status, headers, config) {
      console.log('Error: ' + data);
    });
    /***$http({
      method: 'GET',
      url: '/object/proveedor'
    }).
    success(function(data, status, headers, config) {
      $scope.rowCollection = data;
    }).
    error(function(data, status, headers, config) {
      console.log('Error: ' + data);
    // called asynchronously if an error occurs
    // or server returns response with an error status.
    });***/
    //copy the references (you could clone ie angular.copy but then have to go through a dirty checking for the matches)
    $scope.displayedCollection = [].concat($scope.rowCollection);
  }
});