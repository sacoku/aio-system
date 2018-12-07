var app = angular.module('app', ['btford.socket-io', 'angular.morris']);

/** @description
 *
 */
app.service('SocketService', ['socketFactory', function(socketFactory) {
    return socketFactory({
        ioSocket: io.connect('http://10.1.2.155:8080')
    });
}]);

app.filter('range', function() {
    return function(input, total) {
        total = parseInt(total);
        for (var i=0; i<total; i++)
            input.push(i);
        return input;
    };
});

/** @description
 *
 */
app.service('daumMap', function() {
    this.init = function(lat, lon, zoom) {
        var options = {
            center: new daum.maps.LatLng(lat, lon),
            level: zoom
        };

        this.map = new daum.maps.Map(document.getElementById('map'), options);
    }

    this.setMarker = function(lat, lon) {
        let moveLatlon = new daum.maps.LatLng(lat, lon);
        let marker = new daum.maps.Marker({
            position: moveLatlon
        });

        marker.setMap(this.map);
    }

    this.setMove = function(lat, lon) {
        let moveLatlon = new daum.maps.LatLng(lat, lon);
        this.map.panTo(moveLatlon);
    }

    this.getAddress = function(lat, lon) {
        var geocoder = new daum.maps.services.Geocoder();
        geocoder.coord2Address(lat, lon, function(result, status) {
            if (status === daum.maps.services.Status.OK) {
                alert(result);
            }
        });
    }
});

/** @description
 *
 */
app.controller('mainController', ['$scope', '$http', 'SocketService', 'daumMap', function($scope, $http, SocketService, daumMap) {
    getDeviceInfo($http, function(data) {
        $scope.devices = data;
        $scope.onChangedDevice(data[0].dev_id, data[0].longitude, data[0].latatude);
    });
    /*
    getSensorData($http, function(data) {
        $scope.sensorData = data.slice(0, 10);
    });
    */

    $scope.onChangedDevice = function(dev_id, latitude, longitude) {
        $scope.dev_id = dev_id;

        getGraphInfo($http, '/api/daily_data', dev_id, function(data) {
            $scope.daily_data = data;
        })

        getGraphInfo($http, '/api/monthly_data', dev_id, function(data) {
            $scope.monthly_data = data;
        })

        getGraphInfo($http, '/api/yearly_data', dev_id, function(data) {
            $scope.yearly_data = data;
        })

        if(latitude > 30 || longitude > 125)
            daumMap.setMove(latitude.toFixed(5), longitude.toFixed(5));
    }

    $scope.reset = function(id) { onReset($http, id, function(data) {
        alert(data);
    }); }

    $scope.control = function(id) {
        let data = {
            dw: 1,
            broad: 1,
            st: 1,
            et: 1,
            sv: 1,
            ev: 1
        };

        onControl($http, id, data, function(data) {
        alert(data);
    }); }

    daumMap.init(37.474884, 127.138546);
    daumMap.setMarker(37.474884, 127.138546);
    daumMap.getAddress(37.474884, 127.138546);
}]);

/** @description
 *
 */
app.controller('graphCtrl', ['$scope', '$http', 'SocketService', function($scope, $http, SocketService) {
}]);

function onReset($http, id, onSuccess) {
    $http.get('/api/device_reset?dev_id=' + id)
        .success(onSuccess);
}

/** @description
 *
 * @param $http
 * @param id
 */
function onControl($http, id, data, onSuccess) {
    $http.get('/api/device_ctrl?dev_id=' + id + '&args=' + window.encodeURIComponent(JSON.stringify(data)))
        .success(onSuccess);
}

/** @description
 *
 * @param $http
 * @param onSuccess
 */
function getSensorData($http, onSuccess) {
    $http.get('/api/sensorData')
        .success(onSuccess);
}

/** @description
 *
 * @param $http
 * @param onSuccess
 */
function getDeviceInfo($http, onSuccess) {
    $http.get('/api/devices')
        .success(onSuccess);
}

/** @description
 *
 * @param $http
 * @param url
 * @param dev_id
 * @param onSuccess
 */
function getGraphInfo($http, url, dev_id, onSuccess) {
    $http.get(url + '?dev_id=' + dev_id)
        .success(onSuccess);
}