#!/usr/bin/env node

/**
 * Created by lmg on 17.06.16.
 */

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var path = require('path');
var uglify = require('uglify-js');
var cheerio = require('cheerio');
var interceptor = require('express-interceptor');
var serveIndex = require('serve-index');
var chokidar = require('chokidar');

// parse arguments
var args = process.argv.slice(2);

var dir = process.cwd();
if (args[0]) {
    dir = path.resolve(dir, args[0]);
}

var port = 8888;
if (args[1]) {
    port = parseInt(args[1], 10);
}

// inject minified client side JS
var clientSocket = fs.readFileSync(path.resolve(__dirname, 'node_modules/socket.io-client/socket.io.js'), 'utf8');
var clientCommon = fs.readFileSync(path.resolve(__dirname, 'lib/inject.js'), 'utf8');
var injectScript = uglify.minify(clientSocket + clientCommon, {fromString: true}).code;

var scriptInterceptor = interceptor(function (req, res) {
    return {
        // only intercept HTML responses
        isInterceptable: function () {
            return /text\/html/.test(res.get('Content-Type'));
        },
        // appends minified script tag at the end of the response body
        intercept: function (body, send) {
            var $document = cheerio.load(body);
            $document('head').append('<script>' + injectScript + '</script>');
            send($document.html());
        }
    };
});
app.use(scriptInterceptor);


app.use(express.static(dir));
// app.get('/', function (req, res) {
//     res.sendFile(path.resolve(dir, 'quad_view.html'));
// });
app.use('/', serveIndex(dir, {
    icons: true,
    filter: function (filename, index, files, dir) {
        return !!filename.match(/\.html$/);
    },
    view: 'tiles'
}));

// handle websocket connections
io.on('connection', function (socket) {
    console.log(' [socket] %s connected.', socket.id);

    var channel = '';

    if (socket.handshake.query.channel) {
        channel = socket.handshake.query.channel;
        console.log('   initially joined #%s.', channel);
        socket.join(channel);
    }

    socket.on('JOIN', function (channel) {
        console.log(' [socket] %s joined #%s.', socket.id, channel);
        socket.join(channel);
    });
    socket.on('PART', function (channel) {
        console.log(' [socket] %s left #%s.', socket.id, channel);
        socket.leave(channel);
    });

    socket.on('CMD', function (data) {
        var type = data.type;
        delete data.type;
        console.log('=> #' + channel, '[' + type + ']', data);
        io.to(channel).emit(type, data); // broadcast to channel
    });
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});

// watch for changes and send reload events
chokidar
    .watch(dir, {
        ignored: /[\/\\]\./
    })
    .on('change', function (path) {
        console.log('file changed:', path);
        //io.emit('change', path);
        io.to('autoreload').emit('reload');
    });

// start
http.listen(port, function () {
    console.log('serving "%s" at -> http://localhost:%s', dir, port);
});
