run like:
    ./alfred

optionally specify directory to serve (defaults to current)
    ./alfred some_dir_containing_HTML

optionally specify port (defaults to 8888)
    ./alfred some_dir -p 1234


to use .php files run
./alfred --php

prerequisite:
 npm install express-php
 apt install php-cgi

=> go point your browser to http://localhost:8888


to serve secure pages (e.g. for Storage API experiments)
 ./alfred --ssl
and use a secure URL: https://localhost:8888
