/**
 * this client side JS will be injected
 *  in all *.html pages served by alfred
 */

(function () {
    function reloadPage() {
        window.location.reload();
    }

    var socket = io.connect();
    socket.on('connect', function () {
        console.log('at your service.');
    });
    socket.on('reload', reloadPage);
    socket.io.on('reconnect', reloadPage);

    // remote logging function
    window.rlog = function (msg) {
        socket.emit('log', msg);
    };

})();