angular.module('stk.authentication',['ui.router','authenticationServices'])
.config(function config( $stateProvider ) {
  $stateProvider.state( '/login', {
    url: '/login',
    views: {
      "main": {
        controller: 'AuthenticationCtrl',
        templateUrl: 'partialsfree/auth/login'
      }
    },
    data:{ pageTitle: 'Iniciar Sesión' }
  })
  .state('/register', {
    url: '/register',
    views: {
      "main": {
        controller: 'AuthenticationCtrl',
        templateUrl: 'partials/auth/register'
      }
    },
    data:{ pageTitle: 'Registro' }
  })
  .state('/forgot', {
    url: '/forgot',
    views: {
      "main": {
        controller: 'AuthenticationCtrl',
        templateUrl: 'partials/auth/forgot'
      }
    },
    data:{ pageTitle: 'Recuperar Contraseña' }
  })
})
.run( function run ($localStorage, $rootScope, $location) {
  if (typeof $localStorage.token !== 'undefined') {
    //$rootScope.$apply(function() { $location.path('/login') });
    $location.path('/');
  }
})
.controller( 'AuthenticationCtrl', function AuthenticationCtrl( $rootScope, $scope, $location, authenticationFactory, $stateParams, $localStorage) {
  //alert($localStorage.token);
  $scope.rowCollection = [];
  $scope.displayedCollection = [];
  $scope.auth = function () {
    var userData = $scope.user;
    var data = authenticationFactory.auth(angular.toJson(userData));
    data.
    success(function(data, status, headers, config) {
      if (status === 200) {
        $localStorage.token = data.token;
        console.log($localStorage.token);
      };
      setTimeout(function(){
        //$scope.$apply(function() { $location.path('/empresa/list') });
        //$scope.$apply(function() { $window.location.href('/') });
        window.location = "/";
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