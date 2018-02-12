# alfred
*at your service*

started its life as a quick'n'dirty tool to keep a webpage open and automatically reload when files change.

it works by injecting a small socket.io client in all html documents served that gets notified in case there's a need to reload because any of the watched files changed.

other files can be injected (useful for e.g. adding some functionality to all served pages)
file-watching can be turned off
so it also proofed useful as a small webserver on exhibitions or in clients' showroom situations.

## install
## usage
```alfred [-p PORT] [ROOT]```

## arguments

optionally specify directory to serve files from (defaults to current)  
    ```./alfred some_dir_containing_HTML```

### -p PORT
optionally specify port (defaults to 8888)  
    ```./alfred some_dir -p 1234```
if it fails to open this port it will try the next higher one  
TODO: fails when?

### -i INJECT.js
custom script injection into all served .html files

### -s
static mode

### serve php
to use .php files run  
```./alfred --php```

###### prerequisite
```npm install express-php```  
```apt install php-cgi```

=> go point your browser to http://localhost:8888

### static mode
use this to server large directories with loads of content, that would otherwise be expensive to watch for changes.  
also nice for production use!  
```./alfred -s```

### secure mode
to serve secure pages (e.g. for experiments with the Storage API or other technologies that only work when served from https sources)  
 ```./alfred --ssl```  
and use a secure URL: https://localhost:8888

if you want to create you own keys and certficate (a good idea) in the _secure/_ directory:
```
openssl genrsa -out privatekey.pem 2048
openssl req -new -key privatekey.pem -out alfred.csr
openssl x509 -req -in alfred.csr -signkey privatekey.pem -out certificate.pem
```


# TODO: docs need love
* install: alias to full path
* put alfred in path (symlink into ..)
* /ping -> {"pong":1489739916355} feature
