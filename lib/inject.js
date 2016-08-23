/**
 * this client side JS will be injected
 *  in all *.html pages served by alfred
 */

(function () {

    // connect to server
    var socket = io.connect();
    socket.on('connect', function () {
        console.log('at your service.');
    });
    socket.on('reload', reloadPage);
    socket.io.on('reconnect', reloadPage);

    // hijack console.log and send a copy to the server
    var olog = window.console.log;
    window.console.log = function () {
        var args = Array.prototype.slice.call(arguments);
        socket.emit.apply(socket, ['log'].concat(args));
        olog.apply(window.console, args);
    };

    function reloadPage() {
        // allow blocking reload using ?noreload url parameter
        if (!/\Wnoreload/.test(window.location.search))
            window.location.reload(true); // force reloaded from server
    }

    // handy wrappers
    socket.join = function (channel) {
        socket.emit('_JOIN_', channel);
    };
    socket.send = function () {
        var args = Array.prototype.slice.call(arguments);
        socket.emit.apply(socket, ['_SEND_'].concat(args));
    };
    socket.init = function (callback) {
        if (socket.connected) callback();
        else socket.on('connect', callback);
    };
    window.alfred = socket;

})();