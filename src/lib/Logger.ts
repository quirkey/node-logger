import { isFormattableString, pad, dateFormatter } from "./util";
import colors from 'colors/safe';
import util from 'node:util';
import ConsoleTransport from "../transports/console";
import FileTransport from "../transports/file";

enum LogLevel {
  emerg,
  alert,
  crit,
  error,
  warning,
  notice,
  info,
  debug
};

export type LogLevels = keyof typeof LogLevel;
export type LogLevelsColors = keyof typeof colors;

export type LoggerOptions = {
  log_level: LogLevels;
  transports: Array<'file' | 'console' | StandardTransport | CustomTransport>;
  formatDate: typeof dateFormatter;
  debug: boolean;
};

export interface StandardTransport {
  write(message: string, log_level: LogLevels, logger: Logger ):any;
}

export interface CustomTransport {
  writeCustom(args: Parameters<typeof console.log>, log_level: LogLevels, date: Date, logger: Logger ):any;
};

export type Transports = Array<'file' | 'console' | StandardTransport | CustomTransport>;

const defaults:LoggerOptions = {
  log_level:'debug',
  transports:['console'],
  formatDate:dateFormatter,
  debug:false
};

let isDebug = false;
const debug = (m:string) => isDebug && process.stdout.write(m+"\n")

export default class Logger {
  private options:LoggerOptions;
  public levels:Record<LogLevels,LogLevelsColors>={
    emerg:'red',
    alert: 'red',
    crit: 'red',
    error: 'red',
    warning:'yellow',
    notice:'cyan',
    info:'cyan',
    debug:'cyan'
  };
  private transports:(CustomTransport|StandardTransport)[];

  constructor(_options:Partial<LoggerOptions> = {}) {
    if (typeof _options !== 'object') {
      throw new Error('configuration error: options must be an object');
    }
    this.options = { ...defaults, ..._options };
    isDebug = this.options.debug;
    this.setTransports(this.options.transports);
  }

  private getIndex(k:LogLevels):number {
    return LogLevel[this.levels[k]];
  }

  public setLevel(new_level:LogLevels) {
    if (!this.levels.hasOwnProperty(new_level)) {
      throw new Error('invalid log_level (' + new_level + ') supplied.');
    }
    this.options.log_level = new_level;
  }

  public setTransports(transports:Transports) {
    if (!Array.isArray(transports)) {
      throw new Error('transports must be an array.');
    }
    this.transports = transports.map(transport => {
      if (typeof transport === 'string') {
        try {
          return transport === 'file' ? new FileTransport() : new ConsoleTransport();
        }
        catch (err) {
          debug(err);
          throw new Error('Unknown built-in transport named `' + transport + '`. ');
        }
      }
      if (typeof transport === 'object') {
        if ((transport as any).write && typeof (transport as any).write === 'function') {
          return transport;
        }
        else if ((transport as any).writeCustom && typeof (transport as any).writeCustom === 'function') {
          return transport;
        } else {
          throw new Error('invalid transport provided (' + ((transport as any) as Function).name + '). Transports must be an object with a function called `write` or `writeCustom` ');
        }
      }else{
        throw new Error('invalid transport provided (' + (transport as Function).name + '). Transports must be an object with a function called `write` or `writeCustom` ');
      }
    })
  }

  isError(level) {
    return ['emerg', 'alert', 'crit', 'error'].indexOf(level) !== -1;//tells if a log level is one of the 4 error levels
  }

  setDateFormat(fn:typeof dateFormatter) {
    this.options.formatDate = fn;
  }

  write(text:string, level:LogLevels, date:Date, args:any[]) {
    this.transports.forEach(transport => transport.hasOwnProperty('writeCustom') ? (transport as CustomTransport).writeCustom(args, level, date, this) : (transport as StandardTransport).write(text, level, this));
  }

  format(level:LogLevels, date:Date, message) {
    return [colors[this.levels[this.getIndex(level)]](pad(level, 7)), ' [', this.options.formatDate(date), '] ', message].join('');
  }

  log( log_level: LogLevels, message?:any, ...optionalParams:any[] ):string|void;
  log( message?:any, ...optionalParams:any[] ):string|void;
  log( ...args: [LogLevels,...Parameters<typeof console.log>] | Parameters<typeof console.log> ):string|void {
    if (!args.length) {
      return;
    }
    const log_level = this.levels.hasOwnProperty(args[0]) ? args.shift() : 'info';
    const index = this.getIndex(log_level);
    let message = '';
    if (index >= this.getIndex(this.options.log_level)) {
      if (isFormattableString(args)) {
        debug('logger: formatting message');
        message = util.format(...args);
      } else {
        // join the arguments into a loggable string
        args.forEach(arg => {
          if (typeof arg === 'string') {
            message += ' ' + arg;
          } else {
            message += ' ' + util.inspect(arg, false, null);
          }
        });
      }
      const date = new Date();
      message = this.format(log_level, date, message);
      this.write(message + "\n", log_level, date, args);
      return message;
    }
  }


}