const {createLogger} = require('./logger');

const log = createLogger({log_level:'debug',transports:['file']});//default options are shown.  

log('hi!');//default log level is info
log.info('hi!');
log.error(new Error('test'));
log.warning('warning message');
log.debug('blah blah blah');
log.alert('an important error');
log.crit('a critical error');
log.emerg('an emergency error');
log.notice('a notice');