angular.module('production.colaborador',['ui.router','colaboradorServices', 'rolServices'])
.config(function config( $stateProvider ) {
  $stateProvider.state( '/colaborador', {
    url: '/colaborador',
    views: {
      "main": {
        controller: 'ColaboradorCtrl',
        templateUrl: 'partials/colaborador/colaborador'
      }
    },
    data:{ pageTitle: 'Colaborador' }
  })
  .state('/colaborador/list', {
    url: '/colaborador/list',
    views: {
      "main": {
        controller: 'ColaboradorCtrl',
        templateUrl: 'partials/colaborador/colaborador_list'
      }
    },
    data:{ pageTitle: 'Colaborador' }
  })
  .state('colaborador_edit', {
    url: '/colaborador_edit/:id',
    views: {
      "main": {
        controller: 'ColaboradorCtrl',
        templateUrl: 'partials/colaborador/colaborador_edit'
      }
    },
    data:{ pageTitle: 'Colaborador' }
  })
})
.controller( 'ColaboradorCtrl', function ColaboradorCtrl( $scope, $location, colaboradorFactory, rolFactory, $stateParams) {
  $scope.rowCollection = [];
  $scope.displayedCollection = [];
  $scope.createColaborador = function () {
    var defaultColaborador = {
      cedula: "",
      nombre: "",
      telefono: "",
      rol_id: ""
    };
    var colaborador = $scope.colaborador;
    var data = colaboradorFactory.saveColaborador($.param(colaborador));
    data.
    success(function(data, status, headers, config) {
      $scope.colaboradorForm.$setPristine();
      $scope.colaborador = defaultColaborador;
      sweetAlert("Exito!", "Creado Satisfactoriamente!", "success");
      setTimeout(function(){
        $scope.$apply(function() { $location.path('/colaborador/list') });
      },1500);
    }).
    error(function(data, status, headers, config) {
      console.log('Error: ' + data);
    });
  },
  $scope.getColaboradores = function getColaboradores(tableState) {
    $scope.isLoading = true;
    var pagination = tableState.pagination;
    var start = tableState.pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
    tableState.pagination.start = start;
    var number = tableState.pagination.number || 10;  // Number of entries showed per page.
    tableState.pagination.number = number;
    colaboradorFactory.getColaboradores(start, number, tableState, function(datos){
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
      var data = colaboradorFactory.deleteColaborador(row.id);
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
  $scope.updateColaborador = function () {
    var colaborador = $scope.colaborador;
    var data = colaboradorFactory.updateColaborador($stateParams.id, $.param(colaborador));
    data.
    success(function(data, status, headers, config) {
      $scope.colaboradorForm.$setPristine();
      sweetAlert("Exito!", "Actualizado Satisfactoriamente!", "success");
      setTimeout(function(){
        $scope.$apply(function() { $location.path('/colaborador/list') });
      },1500);
    }).
    error(function(data, status, headers, config) {
      console.log('Error: ' + data);
    });
  },
  $scope.getColaborador = function getColaborador() {
    var datos = colaboradorFactory.getColaborador($stateParams.id);
    datos.
    success(function (data, status, headers, config) {

      var colaborador = data.colaborador;
      var defaultColaborador = {
        nombre: colaborador.nombre,
        cedula: colaborador.cedula,
        telefono: colaborador.telefono,
        rol_id: colaborador.rol_id
      };
      $scope.roles = data.rol;
      $scope.colaborador = defaultColaborador;
    });
  },
  $scope.getRoles = function getRoles() {
    var datos = rolFactory.getAllRoles();
    datos.then(function (result) {
      $scope.roles = result.data;
    });
  }
});