angular.module('proveedorServices', []).
factory('proveedorFactory',['$http','$q', '$filter', function($http, $q, $filter) {

  var urlBase = '/object/proveedor';
  var urlRelatedBase = '/objectrans/proveedor';
  var filterBase = '/filter/proveedor';
  var dataFactory = {};

  dataFactory.getProveedores = function (start, number, params, callback) {
    var proveedores = [];
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
      proveedores = data.data;
      var deferred = $q.defer();
      var filtered = params.search.predicateObject ? $filter('filter')(proveedores, params.search.predicateObject) : proveedores;
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

  dataFactory.getAllProveedores = function (){
    return $http.get(urlBase);
  };

  dataFactory.saveProveedor = function (data){
    return $http({
      method: 'POST',
      url: urlBase,
      data: data,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    });
  };

  dataFactory.getProveedor = function (id){
    return $http.get(urlBase+"/"+id);
  };

  dataFactory.deleteProveedor = function (id){
    return $http({
      method: 'DELETE',
      url: urlBase+"/"+id
    });
  };

  dataFactory.updateProveedor = function (id, data){
    return $http({
      method: 'PUT',
      url: urlBase+"/"+id,
      data: data,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    });
  };

  dataFactory.getProductoByProveedor = function (id){
    return $http.get(urlRelatedBase+"/"+id+"/producto");
  };

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