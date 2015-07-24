angular.module('stk.object',['ui.router','objectServices'])
.config(function config( $stateProvider ) {
  $stateProvider.state( ':object/form', {
    url: ':object/form',
    parent: '/',
    views: {
      "mainV": {
        controller: 'ObjectCtrl',
        templateUrl: 'partials/object/form'
      }
    },
    data:{ pageTitle: 'form' }
  })
  .state(':object/list', {
    url: ':object/list',
    parent: '/',
    views: {
      "mainV": {
        controller: 'ObjectCtrl',
        templateUrl: 'partials/object/list'
      }
    },
    data:{ pageTitle: 'list' }
  })
  .state(':object/edit/:id', {
    url: ':object/edit/:id',
    parent: '/',
    views: {
      "mainV": {
        controller: 'ObjectCtrl',
        templateUrl: 'partials/object/edit'
      }
    },
    data:{ pageTitle: 'edit' }
  })
})
.controller( 'ObjectCtrl', function ObjectCtrl( $scope, $location, objectFactory, $stateParams) {
  $scope.entity = $stateParams.object;
  $scope.rowCollection = [];
  $scope.displayedCollection = [];
  $scope.createEtapa = function () {
    var defaultEtapa = {
      nombre: "",
      descripcion: ""
    };
    var etapa = $scope.etapa;
    var data = etapaFactory.saveEtapa($.param(etapa));
    data.
    success(function(data, status, headers, config) {
      $scope.etapaForm.$setPristine();
      $scope.etapa = defaultEtapa;
      sweetAlert("Exito!", "Creado Satisfactoriamente!", "success");
      setTimeout(function(){
        $scope.$apply(function() { $location.path('/etapa/list') });
      },1500);
    }).
    error(function(data, status, headers, config) {
      console.log('Error: ' + data);
    });
  },
  $scope.get = function get(tableState) {
    $scope.isLoading = true;
    var pagination = tableState.pagination;
    var start = tableState.pagination.start || 0;     // This is NOT the page number, but the index of item in the list that you want to use to display the table.
    tableState.pagination.start = start;
    var number = tableState.pagination.number || 10;  // Number of entries showed per page.
    tableState.pagination.number = number;
    objectFactory.get($stateParams.object, start, number, tableState, function(datos){
      datos.then(function (result) {
        var thecols = result.data[0];
        $scope.columns = Object.keys(thecols);
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
      var data = etapaFactory.deleteEtapa(row.id);
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
  $scope.updateEtapa = function () {
    var etapa = $scope.etapa;
    var data = etapaFactory.updateEtapa($stateParams.id, $.param(etapa));
    data.
    success(function(data, status, headers, config) {
      $scope.etapaForm.$setPristine();
      sweetAlert("Exito!", "Actualizado Satisfactoriamente!", "success");
      setTimeout(function(){
        $scope.$apply(function() { $location.path('/etapa/list') });
      },1500);
    }).
    error(function(data, status, headers, config) {
      console.log('Error: ' + data);
    });
  },
  $scope.getEtapa = function getEtapa() {
    var datos = etapaFactory.getEtapa($stateParams.id);
    datos.
    success(function (data, status, headers, config) {

      var defaultEtapa = {
        nombre: data.nombre,
        descripcion: data.descripcion
      };
      $scope.etapa = defaultEtapa;
    });
  },
  $scope.isNumber = function (value) {
    return angular.isNumber(value);
  };
});