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

        if(latitude > 30 || longitude > 125) {
            daumMap.setMove(latitude.toFixed(5), longitude.toFixed(5));
            daumMap.setMarker(latitude.toFixed(5), longitude.toFixed(5));
        }
    }

    daumMap.init(37.474884, 127.138546);
}]);

/** @description
 *
 */
app.controller('modalDialog', ['$scope', '$http', 'SocketService', function($scope, $http, SocketService) {
    let timeVal = [];
    let volVal = [];

    for(i = 0; i< 24; i++) {
        timeVal.push({id: i, name: i});
    }

    for(i = 0; i< 7; i++) {
        volVal.push({id: i, name: i});
    }

    $scope.dws = [
        {id: 0, name: "일"},
        {id: 1, name: "월"},
        {id: 2, name: "화"},
        {id: 3, name: "수"},
        {id: 4, name: "목"},
        {id: 5, name: "금"},
        {id: 6, name: "토"}
    ];
    $scope.sel_dw = $scope.dws[0];

    $scope.broads = [
        {id: 0, name: "방송함"},
        {id: 1, name: "방송안함"}
    ];
    $scope.sel_broad = $scope.broads[0];

    $scope.sts = timeVal;
    $scope.sel_st = $scope.sts[0];

    $scope.ets = timeVal;
    $scope.sel_et = $scope.ets[0];

    $scope.svs = volVal;
    $scope.sel_sv = $scope.svs[0];

    $scope.evs = volVal;
    $scope.sel_ev = $scope.evs[0];

    $scope.reset = function(id) { onReset($http, id, function(data) {
        alert(data);
    }); }

    $scope.control = function(id) {
        let data = {
            dw: $scope.sel_dw.id,
            broad: $scope.sel_broad.id,
            st: $scope.sel_st.id,
            et: $scope.sel_et.id,
            sv: $scope.sel_sv.id,
            ev: $scope.sel_ev.id
        };

        onControl($http, $scope, id, data, function(data) {
            alert(data);
        }); }

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
function onControl($http, $scope, id, data, onSuccess) {
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