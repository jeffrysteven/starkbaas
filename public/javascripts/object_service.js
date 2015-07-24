angular.module('objectServices', []).
factory('objectFactory',['$http','$q', '$filter', function($http, $q, $filter) {

  var urlBase = '/object/';
  var filterBase = '/filter/';
  var dataFactory = {};

  dataFactory.get = function (table, start, number, params, callback){
    var datos = [];
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
      url: filterBase + table,
      data: serverParams,
      headers: {'Content-Type': 'application/json'}
    }).
    success(function (data) {
      datos = data.data;
      var deferred = $q.defer();
      var filtered = params.search.predicateObject ? $filter('filter')(datos, params.search.predicateObject) : datos;
      if (params.sort.predicate) {
        filtered = $filter('orderBy')(filtered, params.sort.predicate, params.sort.reverse);
      }
        deferred.resolve({
          data: filtered,
          numberOfPages: Math.ceil(data.dataInfo.count / number)
        });
      callback(deferred.promise);
    });
  }

  dataFactory.find = function (table, id){
    return $http.get(urlBase+table+"/"+id);
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