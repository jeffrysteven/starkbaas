angular.module('production.empresa',['ui.router','empresaServices'])
.config(function config( $stateProvider ) {
  $stateProvider.state( '/empresa', {
    url: '/empresa',
    views: {
      "main": {
        controller: 'EmpresaCtrl',
        templateUrl: 'partials/empresa/empresa'
      }
    },
    data:{ pageTitle: 'Empresa' }
  })
  .state('/empresa/list', {
    url: '/empresa/list',
    views: {
      "main": {
        controller: 'EmpresaCtrl',
        templateUrl: 'partials/empreasa/empresa_list'
      }
    },
    data:{ pageTitle: 'Empresa' }
  })
  .state('empresa_edit', {
    url: '/empresa_edit/:id',
    views: {
      "main": {
        controller: 'EmpresaCtrl',
        templateUrl: 'partials/empresa/empresa_edit'
      }
    },
    data:{ pageTitle: 'Empresa' }
  })
})
.controller( 'EmpresaCtrl', function EmpresaCtrl( $scope, $location, empresaFactory, $stateParams) {
  $scope.rowCollection = [];
  $scope.displayedCollection = [];
  $scope.createEmpresa = function () {
    var defaultEmpresa = {
      nit: "",
      nombre: "",
      direccion: "",
      regimen: "",
      email: "",
      telefono: "",
      gerente: "",
      ciudad: "",
      pais: ""
    };
    var empresa = $scope.empresa;
    var data = empresaFactory.saveEmpresa($.param(empresa));
    data.
    success(function(data, status, headers, config) {
      $scope.empresaForm.$setPristine();
      $scope.empresa = defaultEmpresa;
      sweetAlert("Exito!", "Creada Satisfactoriamente!", "success");
      setTimeout(function(){
        $scope.$apply(function() { $location.path('/empresa/list') });
      },1500);
    }).
    error(function(data, status, headers, config) {
      console.log('Error: ' + data);
    });
  },
  $scope.getEmpresas = function getEmpresas(tableState) {
    $scope.isLoading = true;
    var pagination = tableState.pagination;
    var start = tableState.pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
    tableState.pagination.start = start;
    var number = tableState.pagination.number || 10;  // Number of entries showed per page.
    tableState.pagination.number = number;
    empresaFactory.getEmpresaes(start, number, tableState, function(datos){
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
      var data = empresaFactory.deleteEmpresa(row.id);
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
  $scope.updateEmpresa = function () {
    var empresa = $scope.empresa;
    var data = empresaFactory.updateEmpresa($stateParams.id, $.param(empresa));
    data.
    success(function(data, status, headers, config) {
      $scope.empresaForm.$setPristine();
      sweetAlert("Exito!", "Actualizada Satisfactoriamente!", "success");
      setTimeout(function(){
        $scope.$apply(function() { $location.path('/empresa') });
      },1500);
    }).
    error(function(data, status, headers, config) {
      console.log('Error: ' + data);
    });
  },
  $scope.getEmpresa = function getEmpresa() {
    var datos = empresaFactory.getEmpresa($stateParams.id);
    datos.
    success(function (data, status, headers, config) {

      var defaultEmpresa = {
        nit: data.nit,
        nombre: data.nombre,
        direccion: data.direccion,
        regimen: data.regimen,
        email: data.email,
        telefono: data.telefono,
        gerente: data.gerente,
        ciudad: data.ciudad,
        pais: data.pais
      };
      $scope.empresa = defaultEmpresa;
    });
  }
});