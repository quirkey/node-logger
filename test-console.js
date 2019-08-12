const {createLogger,wrapConsole,unwrapConsole} = require('./logger');

const log = createLogger();

wrapConsole(log);//wraps the console globally

console.log('hi!');
console.warn('warning');
console.error('error');

unwrapConsole();//unwrap console globally

const ConsoleTransport = require('./transports/console');
var customTransports = new ConsoleTransport({nextTick:true});//delay writing logs until next tick

// you can change transports on the fly, not just at the time you created the logger
log.logger.setTransports([customTransports]);

log('now my messages are delayed until next tick');