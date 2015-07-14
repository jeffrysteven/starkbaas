angular.module('production.productoProveedor',['ui.router','productoProveedorServices', 'proveedorServices'])
.config(function config( $stateProvider ) {
  $stateProvider.state('/productoProveedor/list', {
    url: '/productoProveedor/list',
    views: {
      "main": {
        controller: 'ProductoProveedorCtrl',
        templateUrl: 'partials/productoProveedor/productoProveedor_list'
      }
    },
    data:{ pageTitle: 'ProductoProveedor' }
  })
  .state('productoProveedor', {
    url: '/productoProveedor/:id',
    views: {
      "main": {
        controller: 'ProductoProveedorCtrl',
        templateUrl: 'partials/productoProveedor/productoProveedor'
      }
    },
    data:{ pageTitle: 'ProductoProveedorCtrl' }
  })
  .state('productoProveedor_edit', {
    url: '/productoProveedor_edit/:id',
    views: {
      "main": {
        controller: 'ProductoProveedorCtrl',
        templateUrl: 'partials/productoProveedor/productoProveedor_edit'
      }
    },
    data:{ pageTitle: 'Producto' }
  })
})
.controller( 'ProductoProveedorCtrl', function ProductoProveedorCtrl( $scope, $location, productoProveedorFactory, proveedorFactory, $stateParams) {
  $scope.rowCollection = [];
  $scope.displayedCollection = [];
  $scope.rate = 1;
  $scope.max = 5;
  $scope.isReadonly = false;
  $scope.ratingStates = [
    {stateOn: 'glyphicon-ok-sign', stateOff: 'glyphicon-ok-circle'},
    {stateOn: 'glyphicon-star', stateOff: 'glyphicon-star-empty'},
    {stateOn: 'glyphicon-heart', stateOff: 'glyphicon-ban-circle'},
    {stateOn: 'glyphicon-heart'},
    {stateOff: 'glyphicon-off'}
  ];
  $scope.createProductoProveedor = function () {
    var productoProveedor = $scope.productoProveedor;
    $scope.productoProveedor.producto_id = $stateParams.id;
    var data = productoProveedorFactory.saveProductoProveedor($.param(productoProveedor));
    data.
    success(function(data, status, headers, config) {
      $scope.productoProveedorForm.$setPristine();
      if (data.hasOwnProperty("errno")) {
        sweetAlert("Error!", "Ocurrió un error al crear este item COD: "+data.code, "error");
      }else{
        sweetAlert("Exito!", "Creado Satisfactoriamente!", "success");
        setTimeout(function(){
          $scope.$apply(function() { $location.path('/producto_edit/' + $stateParams.id) });
        },1500);
      }
    }).
    error(function(data, status, headers, config) {
      console.log('Error: ' + data);
    });
  },
  $scope.getProductoProveedores = function getProductoProveedores(tableState) {
    $scope.isLoading = true;
    var pagination = tableState.pagination;
    var start = tableState.pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
    tableState.pagination.start = start;
    var number = tableState.pagination.number || 10;  // Number of entries showed per page.
    tableState.pagination.number = number;
    productoProveedorFactory.getProductoProveedores(start, number, tableState, function(datos){
      datos.then(function (result) {
        $scope.displayedCollection = result.data;
        tableState.pagination.numberOfPages = result.numberOfPages;//set the number of pages so the pagination can update
        $scope.isLoading = false;
      });
    });
  },
  $scope.removeItem = function removeItem(row){
    sweetAlert({
      title: "Estas seguro?",
      text: "Si eliminas este registro, no podrás recuperarlo!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Sí, eliminalo!",
      cancelButtonText: "Cancelar",
      closeOnConfirm: false
    },
    function(){
      var data = productoProveedorFactory.deleteProductoProveedor(row.id);
      data.
      success(function(data, status) {
        var index = $scope.displayedCollection.indexOf(row);
        if (index !== -1) {
            $scope.displayedCollection.splice(index, 1);
            sweetAlert("Eliminado!", "El registro ha sido eliminado.", "success");
        }
      }).
      error(function(data, status, headers, config) {
        console.log('Error: ' + data);
      });
    });
  },
  $scope.updateProductoProveedor = function () {
    var productoProveedor = $scope.productoProveedor;
    var data = productoProveedorFactory.updateProductoProveedor($stateParams.id, $.param(productoProveedor));
    data.
    success(function(data, status, headers, config) {
      $scope.productoProveedorForm.$setPristine();
      sweetAlert("Exito!", "Actualizado Satisfactoriamente!", "success");
      setTimeout(function(){
        history.back();
        scope.$apply();
        //$scope.$apply(function() { $location.path('/productoProveedor/list') });
      },1500);
    }).
    error(function(data, status, headers, config) {
      console.log('Error: ' + data);
    });
  },
  $scope.getProductoProveedor = function getProductoProveedor() {
    var datos = productoProveedorFactory.getProductoProveedor($stateParams.id);
    datos.
    success(function (data, status, headers, config) {
      var productoProveedor = data.productoProveedor;
      var defaultProductoProveedor = {
        producto_id: productoProveedor.producto_id,
        proveedor_id: productoProveedor.proveedor_id,
        lead_time: productoProveedor.lead_time,
        prioridad: productoProveedor.prioridad,
        cantidad_minima: productoProveedor.cantidad_minima
      };
      $scope.proveedores = data.proveedor;
      $scope.productoProveedor = defaultProductoProveedor;
    });
  },
  $scope.getProveedores = function getProveedores() {
    var datos = proveedorFactory.getAllProveedores();
    datos.then(function (result) {
      $scope.proveedores = result.data;
    });
  },
  $scope.hoveringPriority = function(value) {
    $scope.overStar = value;
    $scope.percent = 100 * (value / $scope.max);
  },
  $scope.getProveedores = function getProveedores() {
    var datos = proveedorFactory.getAllProveedores();
    datos.then(function (result) {
      $scope.proveedores = result.data;
    });
  }
});