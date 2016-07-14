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
        window.location.reload(true); // force reloaded from server
    }

})();