angular.module('production.rol',['ui.router','rolServices'])
.config(function config( $stateProvider ) {
  $stateProvider.state( '/rol', {
    url: '/rol',
    views: {
      "main": {
        controller: 'RolCtrl',
        templateUrl: 'partials/rol/rol'
      }
    },
    data:{ pageTitle: 'Rol' }
  })
  .state('/rol/list', {
    url: '/rol/list',
    views: {
      "main": {
        controller: 'RolCtrl',
        templateUrl: 'partials/rol/rol_list'
      }
    },
    data:{ pageTitle: 'Rol' }
  })
  .state('rol_edit', {
    url: '/rol_edit/:id',
    views: {
      "main": {
        controller: 'RolCtrl',
        templateUrl: 'partials/rol/rol_edit'
      }
    },
    data:{ pageTitle: 'Rol' }
  })
})
.controller( 'RolCtrl', function RolCtrl( $scope, $location, rolFactory, $stateParams) {
  $scope.rowCollection = [];
  $scope.displayedCollection = [];
  $scope.createRol = function () {
    var defaultRol = {
      nombre: "",
      descripcion: ""
    };
    var rol = $scope.rol;
    var data = rolFactory.saveRol($.param(rol));
    data.
    success(function(data, status, headers, config) {
      $scope.rolForm.$setPristine();
      $scope.rol = defaultRol;
      sweetAlert("Exito!", "Creado Satisfactoriamente!", "success");
      setTimeout(function(){
        $scope.$apply(function() { $location.path('/rol/list') });
      },1500);
    }).
    error(function(data, status, headers, config) {
      console.log('Error: ' + data);
    });
  },
  $scope.getRoles = function getRoles(tableState) {
    $scope.isLoading = true;
    var pagination = tableState.pagination;
    var start = tableState.pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
    tableState.pagination.start = start;
    var number = tableState.pagination.number || 10;  // Number of entries showed per page.
    tableState.pagination.number = number;
    rolFactory.getRoles(start, number, tableState, function(datos){
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
      var data = rolFactory.deleteRol(row.id);
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
  $scope.updateRol = function () {
    var rol = $scope.rol;
    var data = rolFactory.updateRol($stateParams.id, $.param(rol));
    data.
    success(function(data, status, headers, config) {
      $scope.rolForm.$setPristine();
      sweetAlert("Exito!", "Actualizado Satisfactoriamente!", "success");
      setTimeout(function(){
        $scope.$apply(function() { $location.path('/rol/list') });
      },1500);
    }).
    error(function(data, status, headers, config) {
      console.log('Error: ' + data);
    });
  },
  $scope.getRol = function getRol() {
    var datos = rolFactory.getRol($stateParams.id);
    datos.
    success(function (data, status, headers, config) {

      var defaultRol = {
        nombre: data.nombre,
        descripcion: data.descripcion
      };
      $scope.rol = defaultRol;
    });
  }
});