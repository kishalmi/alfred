# alfred
at your service

## usage
run as _alfred_

TODO: doc  
* alias to full path
* put alfred in path (symlink into ..)

## arguments

optionally specify directory to serve (defaults to current)  
    ```./alfred some_dir_containing_HTML```

optionally specify port (defaults to 8888)  
    ```./alfred some_dir -p 1234```


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
to serve secure pages (e.g. for Storage API experiments)
 ```./alfred --ssl```
and use a secure URL: https://localhost:8888
