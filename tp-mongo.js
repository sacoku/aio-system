var mongoose = require('mongoose');

var devices = mongoose.model('devices', {
    dev_id: String,
    longitude: String,
    latitude: String,
    date: Date,
    alive: Boolean
});

var sensorData = mongoose.model('sensorData', {
    dev_id: String,
    green_detect_cnt: Number,
    red_detect_cnt: Number,
    green_bi_detect_cnt: Number,
    rf_signal_cnt: Number,
    date: Date
});

exports.setConnect = function(url) {
    mongoose.connect(url, { useNewUrlParser: true }, function(err) {
        if(err) console.error(err);
        else console.log('mongodb connected.');
    });
}

exports.setDisconnect = function() {
    mongoose.disconnect(function() {
        console.log("mongo db disconnected.");
    })
}

exports.addDevice = function(device) {
    devices.updateOne({dev_id: device.dev_id}, device, {upsert: true, setDefaultsOnInsert: true}, function(err) {
        console.log(device.dev_id + ' updated');
    });
}

exports.getAllDevices = function(func) {
    devices.find(func);
}

exports.getAllSensorData = function(func) {
    sensorData.find(func);
}

exports.getSensorData = function(page, size, func) {
    var query = {}

    query.skip = size * (page - 1);
    query.limit = size;

    sensorData.find({}, {}, query, func);
}

exports.addSensorData = function(data) {
    var s = new sensorData();
    s.dev_id = data.dev_id;
    s.green_detect_cnt = data.green_detect_cnt;
    s.red_detect_cnt = data.red_detect_cnt;
    s.green_bi_detect_cnt = data.green_bi_detect_cnt;
    s.rf_signal_cnt = data.rf_signal_cnt;
    s.date = data.date;

    s.save(function (err, result) {
        console.log(result);
    });
}

