# node-logger

[https://github.com/ystcode/node-logger](https://github.com/ystcode/node-logger)

## SUMMARY

A simple logging library that combines the simple APIs of Ruby's logger.rb and browser-js console.log()

## USAGE

A logger has 5 different levels of logging in a specific order:

    'trace', 'error', 'warn', 'info', 'debug'
    
Each of these log levels has its own method on the logging instance. You can set the maximum log level on a logger at runtime. 

By default, a logger writes to STDOUT, but given a writeable file path, it will log directly to a file.

### Instantiation:

    // node/common.js style 
    var logger = require('logger').createLogger(); // logs to STDOUT
    var logger = require('logger').createLogger('development.log'); // logs to a file

### Logging:

Any of the logging methods take `n` arguments, which are each joined by ' ' (similar to `console.log()`). If an argument is not a string, it is string-ified by `sys.inspect()`

    logger.info('loading an array', [1,2,3], 'now!');
    //=> 2020-6-5 17:50:50 [INFO]  loading an array [ 1, 2, 3 ] now!
    
    logger.debug('this wont be logged');
    //=> 2020-6-5 17:52:52 [DEBUG]  this wont be logged
    
    logger.log('this will be logged default');
    //=> 2020-6-5 17:54:54 [INFO]  this will be logged default
    
    logger.setLevel('debug');
    logger.log('this will be logged now');
    //=> 2020-6-5 17:53:53 [DEBUG]  this will be logged now

### Customization:

You can completely customize the look of the log by overriding the `format()` method on a logger.

    logger.format = function(level, date, message) {
      return date.getTime().toString() + "; " + message;
    };
    logger.debug('message');
    //=> 1276365362167;  message
    
## COMMENTS/ISSUES:

F-f-fork it, baby.

## LICENSE

MIT, see the source.