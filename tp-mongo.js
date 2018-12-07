var mongoose = require('mongoose');

/** @description
 *
 * @type {Model}
 */
var devices = mongoose.model('devices', {
    dev_id: String,
    longitude: Number,
    latitude: Number,
    version: String,
    date: Date,
    alive: Boolean
});

/** @description
 *
 * @type {Model}
 */
var sensorData = mongoose.model('sensorData', {
    dev_id: String,
    green_detect_cnt: Number,
    red_detect_cnt: Number,
    green_bi_detect_cnt: Number,
    rf_signal_cnt: Number,
    date: Date
});

/** @description
 *
 * @type {Model}
 */
var monthlySensorData = mongoose.model('monthSensorData', {
    dev_id: String,
    year: Number,
    month: Number,
    green_detect_cnt: Number,
    red_detect_cnt: Number,
    green_bi_detect_cnt: Number,
    rf_signal_cnt: Number
});

/** @description
 *
 * @type {Model}
 */
var yearlySensorData = mongoose.model('yearSensorData', {
    dev_id: String,
    year: Number,
    green_detect_cnt: Number,
    red_detect_cnt: Number,
    green_bi_detect_cnt: Number,
    rf_signal_cnt: Number
});

/** @description
 *
 * @type {Model}
 */
var accessLog = mongoose.model('accessLog', {
    date: Date,
    ip: String
});

/** @description
 *
 * @param url
 */
exports.setConnect = function(url) {
    mongoose.connect(url, { useNewUrlParser: true }, function(err) {
        if(err) console.error(err);
        else console.log('mongodb connected.');
    });
}

/** @description
 *
 */
exports.setDisconnect = function() {
    mongoose.disconnect(function() {
        console.log("mongo db disconnected.");
    })
}

/** @description
 *
 * @param device
 */
exports.addDevice = function(device) {
    devices.updateOne({dev_id: device.dev_id}, device, {upsert: true, setDefaultsOnInsert: true}, function(err) {
        console.log(device.dev_id + ' updated');
        console.log("lat : " + device.latitude + ", lon : " + device.longitude);
    });
}

/** @description
 *
 * @param func
 */
exports.getAllDevices = function(func) {
    devices.find(func).sort({"dev_id":1});
}

/** @description
 *
 * @param func
 */
exports.getAllSensorData = function(func) {
    var date = new Date().toISOString().slice(0,10)
    sensorData.find({date:{$gte: new Date(date)}}, {}, func).sort({"date":-1});
}

/** @description
 *
 * @param page
 * @param size
 * @param func
 */
exports.getSensorData = function(page, size, func) {
    var query = {}

    query.skip = size * (page - 1);
    query.limit = size;

    sensorData.find({date:{$gte: new Date(date)}}, {}, query, func).sort({"date":-1});
}

/** @description
 *
 * @param id
 * @param date
 * @param func
 */
exports.getDailySensorData = function(id, date, func) {
    sensorData.find({dev_id: id, date:{$gte: new Date(date)}}, {"date":true, "green_detect_cnt":true, "red_detect_cnt":true, "green_bi_detect_cnt":true, "rf_signal_cnt":true}, func).sort({"date":1});
}

/** description
 *
 * @param id
 * @param year
 * @param month
 * @param func
 */
exports.getMonthlySensorData = function(id, year, month, func) {
    monthlySensorData.find({dev_id: id, year:year}, {"month":true, "green_detect_cnt":true, "red_detect_cnt":true, "green_bi_detect_cnt":true, "rf_signal_cnt":true}, func).sort({"month":1});
}

/** @description
 *
 * @param id
 * @param year
 * @param func
 */
exports.getYearlySensorData = function(id, year, func) {
    yearlySensorData.find({dev_id: id}, {"year":true, "green_detect_cnt":true, "red_detect_cnt":true, "green_bi_detect_cnt":true, "rf_signal_cnt":true}, func).sort({"year":1});
}

/** @description
 *
 * @param data
 */
exports.addSensorData = function(data) {
    let s = new sensorData();
    s.dev_id = data.dev_id;
    s.green_detect_cnt = data.green_detect_cnt;
    s.red_detect_cnt = data.red_detect_cnt;
    s.green_bi_detect_cnt = data.green_bi_detect_cnt;
    s.rf_signal_cnt = data.rf_signal_cnt;
    s.date = data.date;

    s.save(function (err, result) {
        console.log(result.dev_id + ' data added.');
    });

    let fromDate = new Date(); fromDate.setDate(1);
    let toDate = new Date(fromDate); toDate.setMonth(toDate.getMonth()+1);
    sensorData.find({dev_id:data.dev_id, "date":{$gte: new Date(fromDate.toISOString().slice(0,10)), $lt: new Date(toDate.toISOString().slice(0,10))}}, {}, function(err, e) {
        let green_detect_cnt = 0;
        let red_detect_cnt = 0;
        let green_bi_detect_cnt = 0;
        let rf_signal_cnt = 0;

        e.forEach(function(ee) {
            green_detect_cnt += ee.green_detect_cnt;
            red_detect_cnt += ee.red_detect_cnt;
            green_bi_detect_cnt += ee.green_bi_detect_cnt;
            rf_signal_cnt += ee.rf_signal_cnt;
        });

        let month = new monthlySensorData();
        month.dev_id = data.dev_id;
        month.year = parseInt(fromDate.toISOString().slice(0, 4));
        month.month = parseInt(fromDate.toISOString().slice(5, 7));
        month.green_detect_cnt = green_detect_cnt/e.length;
        month.red_detect_cnt = red_detect_cnt/e.length;
        month.green_bi_detect_cnt = green_bi_detect_cnt/e.length;
        month.rf_signal_cnt = rf_signal_cnt/e.length;

        monthlySensorData.updateOne({dev_id: month.dev_id, year:month.year, month:month.month}, month, {upsert: true, setDefaultsOnInsert: true}, function(err) {
            console.log(month.dev_id + ' month data updated');
        });

        monthlySensorData.find({dev_id:data.dev_id, "year": fromDate.toISOString().slice(0, 4)}, {}, function(err, y) {
            let green_detect_cnt = 0;
            let red_detect_cnt = 0;
            let green_bi_detect_cnt = 0;
            let rf_signal_cnt = 0;

            y.forEach(function(yy) {
                green_detect_cnt += yy.green_detect_cnt;
                red_detect_cnt += yy.red_detect_cnt;
                green_bi_detect_cnt += yy.green_bi_detect_cnt;
                rf_signal_cnt += yy.rf_signal_cnt;
            });

            let year = new yearlySensorData();
            year.dev_id = data.dev_id;
            year.year = fromDate.toISOString().slice(0, 4);
            year.green_detect_cnt = green_detect_cnt/y.length;
            year.red_detect_cnt = red_detect_cnt/y.length;
            year.green_bi_detect_cnt = green_bi_detect_cnt/y.length;
            year.rf_signal_cnt = rf_signal_cnt/y.length;

            yearlySensorData.updateOne({dev_id: year.dev_id, year:year.year}, year, {upsert: true, setDefaultsOnInsert: true}, function(err) {
                console.log(month.dev_id + ' year data updated');
            });
        });
    });
}

/** @description
 *
 * @param ip
 */
exports.addAccessLog = function(ip) {
    var client = new accessLog();
    client.ip = ip;
    client.date = new Date();

    client.save(function(err) {
        console.log('accessd - ' + ip);
    })
}
