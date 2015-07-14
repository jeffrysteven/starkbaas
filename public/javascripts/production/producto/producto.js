angular.module('production.producto',['ui.router','productoServices','productoProveedorServices'])
.config(function config( $stateProvider ) {
  $stateProvider.state( '/producto', {
    url: '/producto',
    views: {
      "main": {
        controller: 'ProductoCtrl',
        templateUrl: 'partials/producto/producto'
      }
    },
    data:{ pageTitle: 'Producto' }
  })
  .state('/producto/list', {
    url: '/producto/list',
    views: {
      "main": {
        controller: 'ProductoCtrl',
        templateUrl: 'partials/producto/producto_list'
      }
    },
    data:{ pageTitle: 'Producto' }
  })
  .state('producto_edit', {
    url: '/producto_edit/:id',
    views: {
      "main": {
        controller: 'ProductoCtrl',
        templateUrl: 'partials/producto/producto_edit'
      }
    },
    data:{ pageTitle: 'Producto' }
  })
})
.controller( 'ProductoCtrl', function ProductoCtrl( $scope, $location, productoFactory, productoProveedorFactory, $stateParams) {
  $scope.rowCollection = [];
  $scope.displayedCollection = [];
  $scope.createProducto = function () {
    /*$scope.producto.related = ["proveedor"];
    $scope.producto.relation = ["belongsToMany"];*/
    if(!$scope.producto.referencia){
      $scope.producto.referencia = " ";
    }
    var producto = $scope.producto;
    var data = productoFactory.saveProducto($.param(producto));
    data.
    success(function(data, status, headers, config) {
      if (data.hasOwnProperty("errno")) {
        sweetAlert("Error!", "Ocurrió un error al crear este item COD: "+data.code, "error");
      }else{
        sweetAlert("Exito!", "Creado Satisfactoriamente!", "success");
        setTimeout(function(){
          $scope.$apply(function() { $location.path('/productoProveedor/'+data.id) });
          //$scope.$apply(function() { $location.path('/producto_edit/'+data.id) });
        },1500);
      }
    }).
    error(function(data, status, headers, config) {
      console.log('Error: ' + data);
    });
  },
  $scope.getProductos = function getProductos(tableState) {
    $scope.isLoading = true;
    var pagination = tableState.pagination;
    var start = tableState.pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
    tableState.pagination.start = start;
    var number = tableState.pagination.number || 10;  // Number of entries showed per page.
    tableState.pagination.number = number;
    productoFactory.getProductos(start, number, tableState, function(datos){
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
      var data = productoFactory.deleteProducto(row.id);
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
  $scope.updateProducto = function () {
    var producto = $scope.producto;
    var data = productoFactory.updateProducto($stateParams.id, $.param(producto));
    data.
    success(function(data, status, headers, config) {
      sweetAlert("Exito!", "Actualizado Satisfactoriamente!", "success");
      setTimeout(function(){
        $scope.$apply(function() { $location.path('/producto/list') });
      },1500);
    }).
    error(function(data, status, headers, config) {
      console.log('Error: ' + data);
    });
  },
  $scope.getProducto = function () {
    var datos = productoFactory.getProducto($stateParams.id);
    datos.
    success(function (data, status, headers, config) {

      var defaultProducto = {
        referencia: data.referencia,
        nombre: data.nombre,
        stock_minimo: data.stock_minimo,
        unidad_medida: data.unidad_medida,
        descripcion: data.descripcion,
        isMP: data.isMP,
        precio: data.precio
      };
      $scope.producto = defaultProducto;
    });
  },
  $scope.validateIsChecked = function (){
    var precioEl = angular.element(document.querySelector( '#producto_precio' ) );
    var referenciaEl = angular.element(document.querySelector( '#referencia' ) );
    if(!$scope.producto.isMP){
      precioEl.attr('required','required');
      referenciaEl.attr('required','required');
    }else{
      precioEl.removeAttr('required');
      referenciaEl.removeAttr('required');
    }
  },
  $scope.getProveedoresByProducto = function (){
    var datos = productoProveedorFactory.getProductoProveedores($stateParams.id);
    datos.
    success(function (data, status, headers, config) {
      var defaultProducto = {
        id: data.id,
        referencia: data.referencia,
        nombre: data.nombre,
        stock_minimo: data.stock_minimo,
        unidad_medida: data.unidad_medida,
        descripcion: data.descripcion,
        isMP: data.isMP,
        precio: data.precio,
        proveedores: data.proveedors
      };
      $scope.producto = defaultProducto;
    });
  },
  $scope.removeItemProveedor = function removeItemProveedor(row){
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
      var data = productoProveedorFactory.deleteProductoProveedor(row._pivot_id);
      data.
      success(function(data, status) {
        var index = $scope.producto.proveedores.indexOf(row);
        if (index !== -1) {
            $scope.producto.proveedores.splice(index, 1);
            sweetAlert("Eliminado!", "El registro ha sido eliminado.", "success");
        }
      }).
      error(function(data, status, headers, config) {
        console.log('Error: ' + data);
      });
    });
  }
});