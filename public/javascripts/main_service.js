angular.module('mainServices', []).
factory('mainFactory',['$http','$q', '$filter', function($http, $q, $filter) {

  var urlBase = '/app';
  var dataFactory = {};

  dataFactory.menu = function (data){
    return $http({
      method: 'GET',
      url: urlBase + '/permissions',
      data: data,
      headers: {'Content-Type': 'application/json'}
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