/**
 * Created by lmg on 17.06.16.
 */

function Ray(channel) {
    var that = this;
    var socket = io.connect('', {
        query: 'channel=' + channel
    });
    socket.on('connect', function () {
        console.log('ray connected to #' + channel);
    });
    this.cmd = function (type, data) {
        console.log('=> #' + channel, type, data);
        // ensure data is an object, so we can add properties
        if (typeof data !== 'object')
            data = {
                val: data
            };

        // data.channel = channel;
        data.type = type;
        socket.emit('CMD', data);
    };
    this.on = function (event, handler) {
        socket.on(event, handler);
    };
    this.on('reload', function () {
        window.location.reload();
    });

    this.autoreload = function (bEnabled) {
        if (bEnabled)
            socket.emit('JOIN', 'autoreload');
        else
            socket.emit('PART', 'autoreload');
    }
}

var ar = new Ray();
ar.autoreload(true);

