angular.module('production.compra',['ui.router','compraServices', 'proveedorServices'])
.config(function config( $stateProvider ) {
  $stateProvider.state( '/compra', {
    url: '/compra',
    views: {
      "main": {
        controller: 'CompraCtrl',
        templateUrl: 'partials/compra/compra'
      }
    },
    data:{ pageTitle: 'Compra' }
  })
  .state('/compra/list', {
    url: '/compra/list',
    views: {
      "main": {
        controller: 'CompraCtrl',
        templateUrl: 'partials/compra/compra_list'
      }
    },
    data:{ pageTitle: 'Compra' }
  })
  .state('compra_edit', {
    url: '/compra_edit/:id',
    views: {
      "main": {
        controller: 'CompraCtrl',
        templateUrl: 'partials/compra/compra_edit'
      }
    },
    data:{ pageTitle: 'Compra' }
  })
})
.controller( 'CompraCtrl', function CompraCtrl( $scope, $location, compraFactory, proveedorFactory, $stateParams) {
  $scope.rowCollection = [];
  $scope.displayedCollection = [];
  $scope.actualdate = new Date();
  $scope.productos = [{id: 'producto1'}];
  $scope.detalle_compra = [];
  $scope.createCompra = function () {
    var detalle = $scope.detalle_compra;
    var final_detalle = [];
    var totalproducto = 0;
    var totaliva = 0;
    detalle.forEach(function(element, index){
      totalproducto += parseFloat((element.total).replace(',',''));
      totaliva += (element.cantidad*element.costo)*(element.iva/100);
      var detail = {
        cantidad: element.cantidad,
        costo: element.costo,
        iva: element.iva,
        referencia: element.producto.referencia,
        nombre_producto: element.producto.nombre,
        producto_id: element.producto.id
      }
      final_detalle.push(detail);
    });
    $scope.compra.estado = "solicitado";
    $scope.compra.totaliva = totaliva;
    $scope.compra.total = totalproducto;
    var objMasterDetail = {
      master: $scope.compra,
      detail: final_detalle
    }
    var data = compraFactory.saveCompra(angular.toJson(objMasterDetail));
    data.
    success(function(data, status, headers, config) {
      if (data.hasOwnProperty("errno")) {
        sweetAlert("Error!", "Ocurrió un error al crear la compra COD: "+data.code, "error");
      }else{
        sweetAlert("Exito!", "Creado Satisfactoriamente!", "success");
        setTimeout(function(){
          $scope.$apply(function() { $location.path('/compra/list') });
        },1500);
      }
    }).
    error(function(data, status, headers, config) {
      console.log('Error: ' + data);
    });
  },
  $scope.getCompras = function getCompras(tableState) {
    $scope.isLoading = true;
    var pagination = tableState.pagination;
    var start = tableState.pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
    tableState.pagination.start = start;
    var number = tableState.pagination.number || 10;  // Number of entries showed per page.
    tableState.pagination.number = number;
    compraFactory.getCompras(start, number, tableState, function(datos){
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
      var data = compraFactory.deleteCompra(row.id);
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
  $scope.updateCompra = function () {
    var compra = $scope.compra;
    var data = compraFactory.updateCompra($stateParams.id, $.param(compra));
    data.
    success(function(data, status, headers, config) {
      sweetAlert("Exito!", "Actualizado Satisfactoriamente!", "success");
      setTimeout(function(){
        $scope.$apply(function() { $location.path('/compra/list') });
      },1500);
    }).
    error(function(data, status, headers, config) {
      console.log('Error: ' + data);
    });
  },
  $scope.getCompra = function () {
    var datos = compraFactory.getCompra($stateParams.id);
    datos.
    success(function (data, status, headers, config) {
      var dataMaster = data.compra;
      var dataDetail = data.detalle_compra;
      var defaultCompra = {
        actualdate: dataMaster.fecha,
        proveedor_id: dataMaster.proveedor_id,
        nofacturaasociada: dataMaster.nofacturaasociada,
        observacion: dataMaster.observacion
      };
      for (var i = 0; i < dataDetail.length; i++) {
        $scope.productos.push({id: 'producto'+i});
      };
      $scope.productos.pop();
      $scope.detalle_compra = dataDetail;
      $scope.compra = defaultCompra;
    });
  },
  $scope.validateIsChecked = function (){
    var precioEl = angular.element(document.querySelector( '#compra_precio' ) );
    var referenciaEl = angular.element(document.querySelector( '#referencia' ) );
    if(!$scope.compra.isMP){
      precioEl.attr('required','required');
      referenciaEl.attr('required','required');
    }else{
      precioEl.removeAttr('required');
      referenciaEl.removeAttr('required');
    }
  },
  $scope.getProveedoresByCompra = function (){
    var datos = compraProveedorFactory.getCompraProveedores($stateParams.id);
    datos.
    success(function (data, status, headers, config) {
      var defaultCompra = {
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
      $scope.compra = defaultCompra;
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
      var data = compraProveedorFactory.deleteCompraProveedor(row._pivot_id);
      data.
      success(function(data, status) {
        var index = $scope.compra.proveedores.indexOf(row);
        if (index !== -1) {
            $scope.compra.proveedores.splice(index, 1);
            sweetAlert("Eliminado!", "El registro ha sido eliminado.", "success");
        }
      }).
      error(function(data, status, headers, config) {
        console.log('Error: ' + data);
      });
    });
  },
  $scope.getProveedores = function getProveedores() {
    var datos = proveedorFactory.getAllProveedores();
    datos.then(function (result) {
      $scope.proveedores = result.data;
    });
  },
  $scope.addNewProducto = function() {
    //console.log($scope.detalle_compra);
    //$scope.detalle_compra = {};
    var newItemNo = $scope.productos.length+1;
    $scope.productos.push({'id':'producto'+newItemNo});
  },
  $scope.removeProducto = function() {
    var newItemNo = $scope.productos.length-1;
    $scope.productos.pop();
    $scope.detalle_compra.splice(newItemNo);
  },
  $scope.showAddChoice = function(producto) {
    return producto.id === $scope.productos[$scope.productos.length-1].id;
  },
  $scope.getProducts = function getProducts(proveedor) {
    var datos = proveedorFactory.getProductoByProveedor(proveedor);
    datos.
    success(function (data, status, headers, config) {
      $scope.productosproveedor = data.productos;
    });
  },
  $scope.setPcode = function(producto, model, label) {
    //console.log(producto);
  };
});