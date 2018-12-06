var app = angular.module('app', ['btford.socket-io', 'angular.morris']);

app.service('SocketService', ['socketFactory', function(socketFactory) {
    return socketFactory({
        ioSocket: io.connect('http://localhost:3000')
    });
}]);

app.controller('mainController', ['$scope', '$http', 'SocketService', function($scope, $http, SocketService) {
    $http.get('/api/devices')
        .success(function(data) {
            $scope.devices = data;
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });

    $http.get('/api/sensorData')
        .success(function(data) {
            $scope.sensorData = data.slice(0, 10);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });

    $scope.click_dev = function(device) {
        $http.get('/api/daily_data?dev_id=' + device.dev_id)
            .success(function(data) {
                $scope.daily_data = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });

        $http.get('/api/monthly_data?dev_id=' + device.dev_id)
            .success(function(data) {
                $scope.monthly_data = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    }

    $scope.daily_data = [{date:2018, green_detect_cnt:0, red_detect_cnt:0, green_bi_detect_cnt:0, rf_signal_cnt:0}];
    $scope.monthly_data = [{month:1, green_detect_cnt:0, red_detect_cnt:0, green_bi_detect_cnt:0, rf_signal_cnt:0}];
    $scope.yearly_data = [{date:2018, green_detect_cnt:0, red_detect_cnt:0, green_bi_detect_cnt:0, rf_signal_cnt:0}];

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