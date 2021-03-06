#!/usr/bin/env node

/**
 * Created by lmg on 17.06.16.
 */

var express = require('express');
var app = express();

var fs = require('fs');
var path = require('path');
var uglify = require('uglify-js');
var cheerio = require('cheerio');
var interceptor = require('express-interceptor');
var serveIndex = require('serve-index');
var chokidar = require('chokidar');
var argv = require('minimist')(process.argv.slice(2), {
  boolean: 'php',
  boolean: 'ssl'
});
var readline = require('readline');

// parse arguments

var dir = process.cwd(); // if not otherwise specified, serve CWD
if (argv._.length) {
  dir = path.resolve(dir, argv._[0]);
}

var port = 8888;
if (argv.p) {
  port = parseInt(argv.p, 10);
}


var server;
if (argv.ssl) {
  var options = {
    key: fs.readFileSync(path.resolve(__dirname, 'secure/privatekey.pem')).toString(),
    cert: fs.readFileSync(path.resolve(__dirname, 'secure/certificate.pem')).toString()
  };
  server = require('https').createServer(options, app);
} else {
  server = require('http').createServer(app);
}


var clientOptional = ''; // optionally injected JS
if (argv.i) {
  // NOTE: any command line supplied paths needs resolving from CWD
  var absFileInject = path.resolve(process.cwd(), argv.i);
  try {
    clientOptional = fs.readFileSync(absFileInject, 'utf8');
    console.log('injecting "%s"', absFileInject);
  } catch (err) {
    console.log('ERROR opening injection file %s "%s".', err.code, absFileInject);
  }
}

// jsonp /ping support (for discovery)
app.get('/ping', function(req, res) {
  res.jsonp({
    pong: Date.now()
  });
});

// inject minified client side JS
var clientSocket = fs.readFileSync(path.resolve(__dirname, 'node_modules/socket.io-client/dist/socket.io.min.js'), 'utf8');
var clientCommon = fs.readFileSync(path.resolve(__dirname, 'lib/inject.js'), 'utf8');
var injectScript = uglify.minify(clientSocket + clientCommon + clientOptional, {
  fromString: true
}).code;

var scriptInterceptor = interceptor(function(req, res) {
  return {
    // only intercept HTML responses
    isInterceptable: function() {
      return /text\/html/.test(res.get('Content-Type'));
    },
    // appends minified script tag at the end of the response body
    intercept: function(body, send) {

      if (/fs$/.test(req.originalUrl)) {
        //if postfixed with ?fs we wrap content in an iframe to keep fullscreen
        var htmlFrame = fs.readFileSync(path.resolve(__dirname, 'lib/frame.html'), 'utf8');
        var $docFrame = cheerio.load(htmlFrame);
        $docFrame('#mainframe').attr('src', req.url.replace(/(\W)fs/, ''));
        send($docFrame.html());
      } else {
        // inject script into end of head
        var $document = cheerio.load(body);
        $document('head').append('<script>' + injectScript + '</script>');
        send($document.html());
      }
    }
  };
});
app.use(scriptInterceptor);

// enable .php CGI
if (argv.php) {
  var php = require('express-php');
  app.use(php.cgi(dir));
}

app.use(express.static(dir));
app.use('/favicon.ico', express.static(path.resolve(__dirname, 'alfred.ico')));
app.use('/', serveIndex(dir, {
  icons: true,
  filter: function(filename, index, files, dir) {
    return !!filename.match(/\.html$/);
  },
  view: 'tiles'
}));

// handle websocket connections
var io = require('socket.io')(server);
io.on('connection', function(socket) {
  console.log(' [socket] %s connected.', socket.id);
  socket.on('log', function() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[socket] ' + socket.id); // unshift returns new length!
    console.log.apply(console, args);
  });

  var currentChannel;
  socket.on('_JOIN_', function(channel) {
    console.log(' [socket] %s JOINs %s.', socket.id, channel);
    if (currentChannel)
      socket.leave(currentChannel);
    socket.join(channel);
    currentChannel = channel;
  });
  socket.on('_SEND_', function(event, data) {
    // console.log(' [socket] %s sending', event, data);
    var target = socket.broadcast;
    if (currentChannel)
      target = target.to(currentChannel);
    target.emit(event, data);
  });

  socket.on('disconnect', function() {
    console.log(' [socket] %s disconnected.', socket.id);
  });
});

// watch for changes and send reload events
if (!argv.s) {
  chokidar
    .watch(dir, {
      ignored: [
        /[\/\\]\./,
        /bower_components/,
        /node_modules/,
        /\.scss$/,
        /\.less$/,
        /\.ts$/
      ]
    })
    .on('change', function(file) {
      console.log('file changed:', file);
      io.emit('reload', path.relative(dir, file));
    });
} else {
  console.log('static mode, not monitoring changes.');
}

// start
function startServer() {
  server.listen(port);
}
server.on('listening', function() {
  var proto = server.hasOwnProperty('key') ? 'https' : 'http'; // only https has .key property
  console.log('serving "%s" at -> %s://localhost:%s', dir, proto, port);
});
server.on('error', function(e) {
  if (e.code == 'EADDRINUSE') {
    console.log('ERROR address in use. trying port %s', ++port);
    startServer();
  }
});

console.log('starting server..');
startServer();


// var rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stderr
// });
// rl.on('line', function (input) {
//     if (input.toUpperCase() === 'RL')
//         io.emit('reload');
// });
// console.log('type RL for manual reload');
