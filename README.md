## INSTALL

`npm install @r3wt/log --save`

## SUMMARY

a simple logger for node.js

## WHY??

I wanted a logger with these features:
- identical output/features provided by `console.log`, but with:
  - color coded log levels 
  - timestamps
- multiple, customizable transports (console and file built in)
- optional ability to override `console` functions `log`,`warn`,`error`,and `info` globally for ease of integration.

I found [this library from quirkey](https://github.com/quirkey/node-logger) and modified it according to the above principals.

## Implementation - Understanding Log levels

- The logger uses (`syslog`)[https://en.wikipedia.org/wiki/Syslog#Severity_level] style log levels, shown below in order of priority (least to greatest):

    debug , info , notice , warning , error , crit , alert , emerg

- The logger has named methods for each of the above log levels (see code examples below)
- Any of the logging methods take `n` arguments, which are each joined by ' ' (similar to `console.log()`).
- You set the default log level, and nothing with a lower priority is logged. 

### API

| function  |  options  | example |
|---|---|---|
| `createLogger(Object options)`  | `{log_level: Enum(debug , info , notice , warning , error , crit , alert , emerg), transports: Array< String|Object >, debug: Bool }  | `createLogger ({log_level:'warning'})` |

### Basic Usage

**a few common use cases are shown below**

create a logger and use the log instance:
```js
const {createLogger} = require('@r3wt/log');
const log = createLogger();

log('the quick %s fox jumped %s the %s %s','brown','over','lazy','dog');//default level is info. 
log.warning('uh oh!');
log.error('oh fudge some bad stuff happened',new Error('am bad stuff. did happen'),{someOtherData:true});// works just like the console, you get the point right?

```


wrapping `console` globally:
```js
const {createLogger,wrapConsole,unwrapConsole} = require('@r3wt/log');
const log = createLogger();
wrapConsole(log);//wraps the console globally with the log instance, making integration into large existing project less painful

// NOTE: only the following 4 functions are wrapped. 
console.log('hi!');
console.warn('warning');
console.error('error');
console.info('info');

unwrapConsole();//unwrap console globally

```


using built in transports `file` and `console`:

```js
const {createLogger} = require('@r3wt/log');
const log = createLogger({transports:['console','file']});//log to console and file. file logger defaults to `process.cwd()` with file names `combined.log` and `error.log` respectively.

```


providing options to built in transports:
```js
const {createLogger} = require('@r3wt/log');
const FileTransport = require('@r3wt/log/transports/file');
const ConsoleTransport = require('@r3wt/log/transports/console');

const myFileTransport = new FileTransport({
    nextTick: true, //delay writing file until process.nextTick function queue is processed
    error:'./my-custom-error-file.log',
    combined: './my-custom-combined-file.log'
});

const myConsoleTransport = new ConsoleTransport({
    nextTick:true //NOTE: if process exits with this enabled, any queued writes to stderr/stdout will be lost. 
});

const log = createLogger({transports:[myFileTransport,myConsoleTransport]});
```


providing custom transports:
```js
const {createLogger} = require('@r3wt/log');

//technique 1 write formatted messages
class CustomTransport1 {
    write(message,level,logger) {
        // every transport must contain a method called write
        // the function is called with formatted message, log level of message, and the logger instance
        // do something with the message
    }
}

//technique 2 customize the formatting of your messages
class CustomTransport2 {
    //use writeCustom to take control of all formatting responsibilities
    writeCustom(level,logger,...args) {
        // format the log to your liking and send it to wherever
    }
}

const myTransport1 = new CustomTransport1;
const myTransport2 = new CustomTransport2

const log = createLogger({
    transports: ['console',myTransport1,myTransport2]//in this example we keep the default console and add our custom Transports as well
});
```


providing a custom date formatter:

```js

const {createLogger} = require('@r3wt/log');

const myDateFormatter = (date) => {
    //format a date how you like
    return date.toLocaleString('en-GB', { timeZone: 'UTC' });
};

const log = createLogger({ formatDate: myDateFormatter });
```

all log functions:
```js
const {createLogger} = require('@r3wt/log');

log('hi!');// alias to log.info()
log.debug('blah blah blah');
log.info('hi!');
log.notice('a notice');
log.warning('warning message');
log.error(new Error('test'));
log.crit('a critical error');
log.alert('an important error');
log.emerg('an emergency error');
```


all exports:
```js
const {createLogger,Logger,wrapConsole,unwrapConsole,isFormattableString} = require('@r3wt/log');
const logger = createLogger();

log.logger;// Logger this is the low level Logger instance. it has some functions you can call directly

log.logger.setTransports([consoleTransport]);//sets the transports on the fly
log.logger.setLevel('warning');//set lo level on the fly
log.logger.setDateFormat(function(date){
    return date.getTime();
});//set the date formatter on the fly

```



## LICENSE

MIT, see the source.