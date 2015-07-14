angular.module('production.proveedor',['ui.router','proveedorServices'])
.config(function config( $stateProvider ) {
  $stateProvider.state( '/proveedor', {
    url: '/proveedor',
    views: {
      "main": {
        controller: 'ProveedorCtrl',
        templateUrl: 'partials/proveedores/proveedor'
      }
    },
    data:{ pageTitle: 'Proveedor' }
  })
  .state('/proveedor/list', {
    url: '/proveedor/list',
    views: {
      "main": {
        controller: 'ProveedorCtrl',
        templateUrl: 'partials/proveedores/proveedor_list'
      }
    },
    data:{ pageTitle: 'Proveedor' }
  })
  .state('proveedor_edit', {
    url: '/proveedor_edit/:id',
    views: {
      "main": {
        controller: 'ProveedorCtrl',
        templateUrl: 'partials/proveedores/proveedor_edit'
      }
    },
    data:{ pageTitle: 'Proveedor' }
  })
})
.controller( 'ProveedorCtrl', function ProveedorCtrl( $scope, $location, proveedorFactory, $stateParams) {
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
      direccion: "",
      razon_social: "",
      banco: "",
      tipo_cuenta: "",
      cuenta: ""
    };
    var proveedor = $scope.proveedor;
    var data = proveedorFactory.saveProveedor($.param(proveedor));
    data.
    success(function(data, status, headers, config) {
      $scope.proveedorForm.$setPristine();
      $scope.proveedor = defaultProveedor;
      sweetAlert("Exito!", "Creado Satisfactoriamente!", "success");
      setTimeout(function(){
        $scope.$apply(function() { $location.path('/proveedor/list') });
      },1500);
    }).
    error(function(data, status, headers, config) {
      console.log('Error: ' + data);
    });
  },
  $scope.getProveedores = function getProveedores(tableState) {
    $scope.isLoading = true;
    var pagination = tableState.pagination;
    var start = tableState.pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
    tableState.pagination.start = start;
    var number = tableState.pagination.number || 10;  // Number of entries showed per page.
    tableState.pagination.number = number;
    proveedorFactory.getProveedores(start, number, tableState, function(datos){
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
      var data = proveedorFactory.deleteProveedor(row.id);
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
  $scope.updateProveedor = function () {
    var proveedor = $scope.proveedor;
    var data = proveedorFactory.updateProveedor($stateParams.id, $.param(proveedor));
    data.
    success(function(data, status, headers, config) {
      $scope.proveedorForm.$setPristine();
      sweetAlert("Exito!", "Actualizado Satisfactoriamente!", "success");
      setTimeout(function(){
        $scope.$apply(function() { $location.path('/proveedor/list') });
      },1500);
    }).
    error(function(data, status, headers, config) {
      console.log('Error: ' + data);
    });
  },
  $scope.getProveedor = function getProveedor() {
    var datos = proveedorFactory.getProveedor($stateParams.id);
    datos.
    success(function (data, status, headers, config) {
      var defaultProveedor = {
        nit: data.nit,
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        contacto: data.contacto,
        ciudad: data.ciudad,
        direccion: data.direccion,
        razon_social: data.razon_social,
        banco: data.banco,
        tipo_cuenta: data.tipo_cuenta,
        cuenta: data.cuenta
      };
      $scope.proveedor = defaultProveedor;
    });
  }
});