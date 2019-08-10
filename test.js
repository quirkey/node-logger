const createLogger = require('./logger');

const log = createLogger();

log.crit(1e5);

log.emerg('test');

log.info('test=%d',5);

log.debug('displays an object %o',{test:true});

log.error(new Error('a test error'));

log.warning('this is a warning');

log.notice('this is a notice');

log(log);