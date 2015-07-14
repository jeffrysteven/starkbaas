angular.module('colaboradorServices', []).
factory('colaboradorFactory',['$http','$q', '$filter', function($http, $q, $filter) {

  var urlBase = '/object/colaborador';
  var urlRelatedBase = '/objectrelated/colaborador';
  var filterBase = '/filter/colaborador';
  var dataFactory = {};

  dataFactory.getColaboradores = function (start, number, params, callback) {
    var colaborador = [];
    var theParam = params.search.predicateObject;
    var searchParam = "";
    if (theParam) {
      searchParam = theParam.$;
    }
    var serverParams = {
      start: params.pagination.start,
      number: params.pagination.number,
      filter: searchParam,
      sortField: params.sort.predicate,
      sortDirection: params.sort.reverse
    };
    $http({
      method: 'POST',
      url: filterBase,
      data: $.param(serverParams),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).
    success(function (data) {
      colaborador = data.data;
      var deferred = $q.defer();
      var filtered = params.search.predicateObject ? $filter('filter')(colaborador, params.search.predicateObject) : colaborador;
      if (params.sort.predicate) {
        filtered = $filter('orderBy')(filtered, params.sort.predicate, params.sort.reverse);
      }
      //var result = filtered.slice(start, start + number);
        deferred.resolve({
          data: filtered,
          numberOfPages: Math.ceil(data.dataInfo.count / number)
        });
      callback(deferred.promise);
    });
  };

  dataFactory.saveColaborador = function (data){
    return $http({
      method: 'POST',
      url: urlBase,
      data: data,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    });
  };

  dataFactory.getColaborador = function (id){
    //return $http.get(urlBase+"/"+id);
    var related_tables = ['rol'];
    var data = {id: id, related: related_tables};
    return $http({
      method: 'POST',
      url: urlRelatedBase,
      data: angular.toJson(data)
    });
  };

  dataFactory.deleteColaborador = function (id){
    return $http({
      method: 'DELETE',
      url: urlBase+"/"+id
    });
  };

  dataFactory.updateColaborador = function (id, data){
    return $http({
      method: 'PUT',
      url: urlBase+"/"+id,
      data: data,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    });
  }

	return dataFactory;
}]).
factory('socket', function($rootScope) {
	var socket = io.connect();
	return {
		on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
	};
});