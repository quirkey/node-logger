const {createLogger,wrapConsole,unwrapConsole,Logger,isFormattableString} = require('./logger');

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
const ConsoleTransport = require('./transports/console');
var customTransports = new ConsoleTransport({nextTick:true});//delay writing logs until next tick

// you can change transports on the fly, not just at the time you created the logger
log.logger.setTransports([customTransports]);

log('now my messages are delayed until next tick');