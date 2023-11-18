import Logger,{LoggerOptions} from "./lib/Logger";
import { isFormattableString } from "./lib/util";

function createLogger(options:LoggerOptions) {
  const logger = new Logger(options);
  const log = (...args:Parameters<typeof console.log>) => {
      logger.log('info',...args);
  };
  Object.keys(logger.levels)
    .forEach(level=>log[level] = (...args:Parameters<typeof console.log>) => logger.log(level,...args));
  log.logger = logger;
  return log;  
}

type ConsoleShim = Partial<Pick<typeof console,'log'|'warn'|'error'|'info'>> & { isWrapped: boolean };

var shim:ConsoleShim = {
  isWrapped: false
};

function wrapConsole( logger ) {
  if(!shim.isWrapped) {
      var c = global.console;
      shim.log = c.log;
      shim.warn = c.warn;
      shim.error = c.error;
      shim.info = c.info;
      c.log = logger.info;
      c.warn = logger.warning;
      c.error = logger.error;
      c.info = logger.info;
      shim.isWrapped = true;
  }
}

function unwrapConsole() {
  if(shim.isWrapped) {
      var c:any = global.console;
      c.log = shim.log;
      c.warn = shim.warn;
      c.error = shim.error;
      c.info = shim.info;
      shim = {
        isWrapped:false
      };
  }
}

export {createLogger,Logger,wrapConsole,unwrapConsole,isFormattableString};