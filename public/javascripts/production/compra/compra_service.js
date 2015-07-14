angular.module('compraServices', []).
factory('compraFactory',['$http','$q', '$filter', function($http, $q, $filter) {

  var urlBase = '/object/compra';
  var filterBase = '/filterrelated/compra';
  var urlRelatedBase = '/objectin/compra';
  var urlMasterDetailBase = '/objectmasterdetail/compra/detalle_compra';
  var dataFactory = {};

  dataFactory.getCompras = function (start, number, params, callback) {
    var compra = [];
    var related_tables = ['proveedor'];
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
      sortDirection: params.sort.reverse,
      related: related_tables
    };
    $http({
      method: 'POST',
      url: filterBase,
      data: angular.toJson(serverParams)
    }).
    success(function (data) {
      compra = data.data;
      var deferred = $q.defer();
      var filtered = params.search.predicateObject ? $filter('filter')(compra, params.search.predicateObject) : compra;
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

  dataFactory.saveCompra = function (data){
    return $http({
      method: 'POST',
      url: urlMasterDetailBase,
      data: data
    });
  };

  dataFactory.getCompra = function (id){
    //return $http.get(urlBase+"/"+id);
    /*var related_tables = ['detalle_compra'];
    var data = {id: id, related: related_tables};
    return $http({
      method: 'POST',
      url: urlRelatedBase,
      data: angular.toJson(data)
    });*/
    return $http({
      method: 'GET',
      url: urlRelatedBase+"/"+id+"/detalle_compra"
    });
  };

  dataFactory.getAllCompras = function (){
    return $http.get(urlBase);
  };

  dataFactory.deleteCompra = function (id){
    return $http({
      method: 'DELETE',
      url: urlBase+"/"+id
    });
  };

  dataFactory.updateCompra = function (id, data){
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