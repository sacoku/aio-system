var app = angular.module('app', ['btford.socket-io', 'angular.morris']);

app.value('angularMomentConfig', {
    timezone: 'Asia/Seoul'
})
app.service('SocketService', ['socketFactory', function(socketFactory) {
    return socketFactory({
        ioSocket: io.connect('http://localhost:3000')
    });
}]);

app.controller('mainController', ['$scope', '$http', 'SocketService', function($scope, $http, SocketService) {
    $http.get('/api/devices')
        .success(function(data) {
            $scope.devices = data;
            $scope.click_dev(data[0]);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });

/*
    $http.get('/api/sensorData')
        .success(function(data) {
            $scope.sensorData = data.slice(0, 10);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });
*/
    $scope.click_dev = function(device) {
        $scope.dev_id = device.dev_id;

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

        $http.get('/api/yearly_data?dev_id=' + device.dev_id)
            .success(function(data) {
                $scope.yearly_data = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    }

    $scope.reset = function(dev_id) {
        $http.get('/api/device_reset?dev_id=' + dev_id)
            .success(function(data) {
                $scope.monthly_data = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    }

    $scope.control = function(dev_id) {
        $http.get('/api/device_ctrl?dev_id=' + dev_id)
            .success(function(data) {
                $scope.monthly_data = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    }

    SocketService.on('status_of_dev', function(msg) {
        console.log('status_of_dev');
    });

    SocketService.on('add_sensor_info', function(msg) {
        console.log('add_sensor_info');
    });
}]);