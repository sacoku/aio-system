var mqtt = require('mqtt');
var util = require('./util.js')
var tp_mongo = require('./tp-mongo.js');;
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var socket = require('./socket.js');

module.exports = function(args) {
    var client = mqtt.connect(args.url, args.options);
    client.on(
        "connect", function() {
        console.log("--> connected : " + args.url);
        Object.keys(args.topics).forEach(function(key) {
            //console.log(" -- subscribe : " + key);
            client.subscribe(key);
        });
    });

    client.on("error", args.onError);
    client.on("message", function(topic, message, packet) {
        parser.parseString(message, function(err, result) {
            var dev_id =  result['m2m:req']['fr'];
            var date = result['m2m:req']['pc'][0]['cin'][0]['ct'][0];
            var buf = result['m2m:req']['pc'][0]['cin'][0]['con'][0];

            for (var bytes = [], c = 0; c < buf.length; c += 2)
                bytes.push(parseInt(buf.substr(c, 2), 16));

            switch(bytes[1]) {
                case 0x10:
                    tp_mongo.addDevice({
                        dev_id: dev_id,
                        longitude: util.getLongitude(bytes),
                        latitude: util.getLatitude(bytes),
                        date: date,
                        alive: true
                    });

                    socket.send('status_of_dev', '');
                    break;
                case 0x20:
                    tp_mongo.addSensorData({
                        dev_id: dev_id,
                        green_detect_cnt: util.getGreenDetectCount(bytes),
                        red_detect_cnt: util.getRedDetectCount(bytes),
                        green_bi_detect_cnt: util.getGreenBICount(bytes),
                        rf_signal_cnt: util.getRFSignalCount(bytes),
                        date: date
                    });

                    socket.send('add_sensor_info', '');
                    break;
            }
        });
    });
}