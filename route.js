var tp_mongo = require('./tp-mongo.js');

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
}