angular.module('proveedorServices', []).
factory('proveedorFactory',['$http', function($http) {

  var urlBase = '/object/proveedor';
  var dataFactory = {};

  dataFactory.getProveedores = function () {
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