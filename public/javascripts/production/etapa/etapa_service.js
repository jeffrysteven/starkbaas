angular.module('etapaServices', []).
factory('etapaFactory',['$http','$q', '$filter', function($http, $q, $filter) {

  var urlBase = '/object/etapa';
  var filterBase = '/filter/etapa';
  var dataFactory = {};

  dataFactory.getEtapas = function (start, number, params, callback) {
    var etapa = [];
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
      etapa = data.data;
      var deferred = $q.defer();
      var filtered = params.search.predicateObject ? $filter('filter')(etapa, params.search.predicateObject) : etapa;
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

  dataFactory.saveEtapa = function (data){
    return $http({
      method: 'POST',
      url: urlBase,
      data: data,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    });
  };

  dataFactory.getEtapa = function (id){
    return $http.get(urlBase+"/"+id);
  };

  dataFactory.getAllEtapas = function (){
    return $http.get(urlBase);
  };

  dataFactory.deleteEtapa = function (id){
    return $http({
      method: 'DELETE',
      url: urlBase+"/"+id
    });
  };

  dataFactory.updateEtapa = function (id, data){
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