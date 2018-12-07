var express = require('express');
var app = express();
var server = require('http').createServer(app);
var bodyParser = require('body-parser');
var logger = require('morgan');
var tp_mqtt = require('./tp-mqtt.js');
var tp_mongo = require('./tp-mongo.js');
var socket = require('./socket.js');
var util = require('./util.js');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(logger('dev'));

tp_mqtt.init({
    url: "mqtt://thingplugpf.sktiot.com",
    options: {
        clientId: "1098628406_01",
        username: "1098628406",
        password: "TkMwb0pJZzNxdWM1bi9NZTJxV24vWXpNVUcybGRYVXlnemxOZ1FqbEJNSU1udENpaE1ZZHVxWkVHVFliMmZvVw==",
        clean:true
    },
    topics: {
        "/oneM2M/req_msg/+/1098628406_01": function(message) {

        },
        "/oneM2M/resp/1098628406_01/+": function(message) {

        }
    },
    onError: function() {
        console.log("error");
    }
});

server.listen(8080, function() {
    console.log('app is started.');
});

socket.init(server);
tp_mongo.setConnect('mongodb://localhost/thingplug');

require('./route.js')(app);