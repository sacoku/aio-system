
var peer = [];
exports.init = function(server) {
    var io = require('socket.io')(server);

    io.on('connection', function(client) {
        peer.push(client);
        console.log('client connect : ' + peer.length);

        client.on('disconnect', function() {
            var i = peer.indexOf(client);
            peer.splice(i, 1);
            console.log('disconnect : ' + peer.length);
        });
    });
}

exports.send = function(tag, msg) {
    peer.forEach(function(client) {
        client.emit(tag, msg);
    })
}