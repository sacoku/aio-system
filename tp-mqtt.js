var mqtt = require('mqtt');
var util = require('./util.js')
var tp_mongo = require('./tp-mongo.js');;
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var socket = require('./socket.js');

var client = undefined;

/** @description
 *
 * @param args
 */
exports.init = function(args) {
    client = mqtt.connect(args.url, args.options);
    client.on(
        "connect", function() {
        console.log("--> mqtt connected : " + args.url);
        Object.keys(args.topics).forEach(function(key) {
            //console.log(" -- subscribe : " + key);
            client.subscribe(key);
        });
    });
    client.on("close", function() {
        console.log('mqtt closed.');
    })

    client.on("error", args.onError);
    client.on("message", function(topic, message, packet) {
        parser.parseString(message, function(err, result) {
            let op = 0;
            let root = result['m2m:req'];
            if(root == null) { root = result['m2m:rsp']; op = 3; }
            else op = root['op'];

            if(op == 1) {
                var dev_id = result['m2m:req']['fr'];
                var date = result['m2m:req']['pc'][0]['cin'][0]['ct'][0];
                var buf = result['m2m:req']['pc'][0]['cin'][0]['con'][0];

                for (var bytes = [], c = 0; c < buf.length; c += 2)
                    bytes.push(parseInt(buf.substr(c, 2), 16));

                switch (bytes[1]) {
                    case 0x10:
                        tp_mongo.addDevice({
                            dev_id: dev_id,
                            longitude: util.getLongitude(bytes),
                            latitude: util.getLatitude(bytes),
                            version: util.getVersion(bytes),
                            location: '미지정',
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

                        var h_data = "TNG-AIO-1100" + 
                                     dev_id[0].substr(8, dev_id[0].length) + 
                                     util.toDecStr(util.getGreenDetectCount(bytes)) + 
                                     util.toDecStr(util.getRedDetectCount(bytes)) + 
                                     util.toDecStr(util.getGreenBICount(bytes)) + 
                                     util.toDecStr(util.getRFSignalCount(bytes));
                        
                        console.log("send data : " + h_data);
                        socket.send('add_sensor_info', '');

                        break;
                }
            } else if(op == 3) {
                ;
            }
        });
    });
}

exports.pubResetRequest = function(id) {
    let topic = '/oneM2M/req/1098628406_01/' + id;
    let message = '<m2m:req' +
        ' xmlns:m2m="http://www.onem2m.org/xml/protocols"' +
        ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
        ' xsi:schemaLocation="http://www.onem2m.org/xml/protocols CDT-requestPrimitive-v1_0_0.xsd">' +
        ' <op>3</op>' +
        ' <to>/0030131000000536/v1_0/mgmtCmd-' + id + '_DevReset</to>' +
        ' <cty>application/vnd.onem2m-prsp+xml</cty>' +
        ' <ri>ri</ri>' +
        ' <fr>origin</fr>' +
        ' <uKey>TkMwb0pJZzNxdWM1bi9NZTJxV24vWXpNVUcybGRYVXlnemxOZ1FqbEJNSU1udENpaE1ZZHVxWkVHVFliMmZvVw==</uKey>' +
        ' <pc>' +
        '   <mgc>' +
        '     <cmt>DevReset</cmt>' +
        '     <exe>true</exe>' +
        '   </mgc>' +
        ' </pc>' +
        '</m2m:req>';

    if(client.connected) {
        client.publish(topic, message, function() {
            console.log(id + ' reset send.');
        });

        return 'ok';
    } else
        return 'not connected.';
}

exports.pubControlRequest = function(id, data) {
    let topic = '/oneM2M/req/1098628406_01/' + id;
    let message = '<m2m:req\n' +
        ' xmlns:m2m="http://www.onem2m.org/xml/protocols"' +
        ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
        ' xsi:schemaLocation="http://www.onem2m.org/xml/protocols CDT-requestPrimitive-v1_0_0.xsd">' +
        ' <op>3</op>' +
        ' <to>/0030131000000536/v1_0/mgmtCmd-' + id + '_extDevMgmt</to>' +
        ' <cty>application/vnd.onem2m-prsp+xml</cty>' +
        ' <ri>ri</ri>' +
        ' <fr>origin</fr>' +
        ' <uKey>TkMwb0pJZzNxdWM1bi9NZTJxV24vWXpNVUcybGRYVXlnemxOZ1FqbEJNSU1udENpaE1ZZHVxWkVHVFliMmZvVw==</uKey>' +
        ' <pc>' +
        '   <mgc>' +
        '   <exe>true</exe>' +
        '   <exra>' + data + '</exra>' +
        '   </mgc>' +
        ' </pc>' +
        '</m2m:req>';

    if(client.connected) {
        client.publish(topic, message, function() {
            console.log(id + ' control send.');
        });

        return 'ok';
    } else
        return 'not connected.';

}
