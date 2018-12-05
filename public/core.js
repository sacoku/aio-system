var app = angular.module('app', ['btford.socket-io']);

app.service('SocketService', ['socketFactory', function(socketFactory) {
    return socketFactory({
        ioSocket: io.connect('http://localhost:3000')
    });
}]);

app.controller('mainController', ['$scope', '$http', 'SocketService', function($scope, $http, SocketService) {
    $http.get('/api/devices')
        .success(function(data) {
            $scope.devices = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });

    $http.get('/api/sensorData')
        .success(function(data) {
            $scope.sensorData = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });

    SocketService.on('status_of_dev', function(msg) {
        console.log('status_of_dev');
    });

    SocketService.on('add_sensor_info', function(msg) {
        console.log('add_sensor_info');
    });
}]);

/*
function mainController($scope, $http) {


    $http.get('/api/devices')
        .success(function(data) {
            $scope.devices = data;
            console.log(data);
            console.log('test');
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });
}
*/