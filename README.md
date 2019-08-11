# node-logger

[http://github.com/r3wt/node-logger](http://github.com/r3wt/node-logger)

## SUMMARY

a simple logger for node.js

## WHY??

I wanted a logger with these features:
- identical output/features provided by `console.log`, but with:
  - color coded log levels 
  - timestamps
- multiple, customizable transports
- optional ability to override `console` functions `log`,`warn`,`error`,and `info` globally for ease of integration.

I found [this library from quirkey](https://github.com/quirkey/node-logger) and modified it according to the above principals.

## USAGE

A logger has 7 different levels of logging in a specific order:

    'emerg','alert','crit','error','warning','notice','info','debug'
    
Each of these log levels has its own method on the logging instance.

### Basic Usage

create a logger and use the log instance:
```js
const {createLogger} = require('<package name>');
const log = createLogger();

log('the quick %s fox jumped %s the %s %s','brown','over','lazy','dog');//default level is info. 
log.warning('uh oh!');
log.error('oh fudge some bad stuff happened',new Error('am bad stuff. did happen'),{someOtherData:true});// works just like the console, you get the point right?

```

wrapping `console` and writing to stdout:
```js
const {createLogger,wrapConsole,unwrapConsole} = require('<package name>');
const log = createLogger();
wrapConsole(log);//wraps the console globally

console.log('hi!');
console.warn('warning');
console.error('error');

unwrapConsole();//unwrap console globally

```

providing a custom transport:

```js
const {createLogger} = require('<package name>');

class CustomTransport {
    write(message,level,logger) {
        // every transport must contain a method called write
        // the function is called with formatted message, log level of message, and the logger instance
        // do something with the message
    }
}

const myTransport = new CustomTransport;

const log = createLogger({
    transports: ['console',myTransport]//in this example we keep the default console transport, but add our own custom transport as well.
});


```

providing a custom date formatter:

```js

const {createLogger} = require('<package name>');

const myDateFormatter = (date) => {
    //format a date how you like
    return date.toLocaleString('en-GB', { timeZone: 'UTC' });
};

const log = createLogger({ formatDate: myDateFormatter });
```

supplying options to built in transports:

```js
const {createLogger} = require('<package name>');
const ConsoleTransport = require('<package name>/transports/console');
var consoleTransport = new ConsoleTransport({nextTick:true});//delay writing logs until next tick
const log = createLogger({transports:[consoleTransport]});

```

the kitchen sink:
```js

const {createLogger,wrapConsole,unwrapConsole,Logger,isFormattableString} = require('<package name>');

const log = createLogger({log_level:'debug',transports:['console']});//default options are shown.  

log('hi!');//default log level is info
log.info('hi!');
log.error(new Error('test'));
log.warning('warning message');
log.debug('blah blah blah');
log.alert('an important error');
log.crit('a critical error');
log.emerg('an emergency error');
log.notice('a notice');

wrapConsole(log);//wraps the console globally

console.log('hi!');
console.warn('warning');
console.error('error');

unwrapConsole();//unwrap console globally

log.logger// Logger this is the low level Logger instance

//lets customize our console transport
const ConsoleTransport = require('<package name>/transports/console');
var consoleTransport = new ConsoleTransport({nextTick:true});//delay writing logs until next tick
// you can change transports on the fly, not just at the time you created the logger
log.logger.setTransports([consoleTransport]);

// change the minimum log level
log.logger.setLevel('warning');//nothing below warnings will be transported



log.logger.setDateFormat

log('now my messages are delayed until next tick');

```

### Logging:

Any of the logging methods take `n` arguments, which are each joined by ' ' (similar to `console.log()`).

## LICENSE

MIT, see the source.