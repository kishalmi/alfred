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
var argv = require('minimist')(process.argv.slice(2));
var readline = require('readline');

// parse arguments
var dir = process.cwd();
if (argv._.length) {
    dir = path.resolve(dir, argv._[0]);
}

var port = 8888;
if (argv.p) {
    port = parseInt(argv.p, 10);
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
app.use('/favicon.ico', express.static(path.resolve(__dirname, 'alfred.ico')));
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
    socket.on('log', function (msg) {
        console.log(' [socket] %s %s', socket.id, msg);
    });
    socket.on('disconnect', function () {
        console.log(' [socket] %s disconnected.', socket.id);
    });
});

// watch for changes and send reload events
chokidar
    .watch(dir, {
        ignored: [
            /[\/\\]\./,
            /bower_components/,
            /node_modules/
        ]
    })
    .on('change', function (file) {
        console.log('file changed:', file);
        io.emit('reload', path.relative(dir, file));
    });

// start
http.listen(port, function () {
    console.log('serving "%s" at -> http://localhost:%s', dir, port);
});


var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.on('line', function (input) {
    if (input.toUpperCase() === 'RL')
        io.emit('reload');
});
console.log('type RL for manual reload');