var tp_mongo = require('./tp-mongo.js');
var tp_mqtt = require('./tp-mqtt.js');
var util = require('./util.js');

/** @description
 *
 * @param app
 */
module.exports = function(app) {
    app.get("/", function() {
        res.render('index2', {});
    });

    app.get('/api/devices', function(req, res) {
        tp_mongo.getAllDevices(function(err, device) {
            if(err) res.send(err);
            else res.json(device);
        });
    });

    app.get('/api/sensorData', function(req, res) {
        var pageNo = parseInt(req.query.pageNo);
        var size = parseInt(req.query.size);

        if(isNaN(pageNo) || isNaN(size)) {
            tp_mongo.getAllSensorData(function (err, s) {
                if (err) res.send(err);
                else res.json(s);
            });
        } else {
            tp_mongo.getSensorData(pageNo, size, function (err, s) {
                if (err) res.send(err);
                else res.json(s);
            });
        }
    });

    app.get('/api/daily_data', function(req, res) {
        var id = req.query.dev_id;

        tp_mongo.getDailySensorData(id, new Date().toISOString().slice(0,10), function(err, s) {
            if (err) res.send(err);
            else res.json(s);
        })
    });

    app.get('/api/monthly_data', function(req, res) {
        var id = req.query.dev_id;

        tp_mongo.getMonthlySensorData(id, new Date().toISOString().slice(0,4), new Date().toISOString().slice(5,7), function(err, s) {
            if (err) res.send(err);
            else res.json(s);
        })
    });

    app.get('/api/yearly_data', function(req, res) {
        var id = req.query.dev_id;

        tp_mongo.getYearlySensorData(id, new Date().toISOString().slice(0,4), function(err, s) {
            if (err) res.send(err);
            else res.json(s);
        })
    });

    app.get('/api/device_reset', function(req, res) {
        var id = req.query.dev_id;
        res.json(tp_mqtt.pubResetRequest(id));
    });

    app.get('/api/device_ctrl', function(req, res) {
        var id = req.query.dev_id;
        var args = JSON.parse(req.query.args);
        res.json(tp_mqtt.pubControlRequest(id, util.getControlData(args)));
    });
}