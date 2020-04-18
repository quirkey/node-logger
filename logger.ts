// name: logger.ts
// version: 0.0.2
// http://github.com/quirkey/node-logger
/*

Copyright (c) 2010 Aaron Quint

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

*/

/**
 * @deprecated module sys: "sys.print" is replaced with process.stdout.
 * : // sys = require("sys");
 */
const path = require('path');
const util = require("util");
const fs = require('fs');


function makeArray(nonarray: any): Array { 
 	return Array.prototype.slice.call(nonarray); 
};

// Create a new instance of Logger, logging to the file at `log_file_path`
// if `log_file_path` is null, log to STDOUT.

interface WritableLogStream {
	write(text: string): any;
}

/**
 * 
 */
class Logger {
	
	STDOUT = process.stdout;
	STDERR = process.stderr;
	DEFAULT_LEVEL = 3;
	levels = ["fatal", "error", "warn", "info", "debug"];
	stream: WritableLogStream;
	fatal: object;
	error: object;
	warn: object;
	info: object;
	error: object;

	/**
	 * Instantiates the Logger class and configures "stream" and "log_level_index" properties.
	 *
	 * @param {string|object|number} log_file_path: Path to writeable stream.
	 * : You can pass an object that implements "write" either directly or in it's prototype.
	 * : The log will than be call the write function of that object with the specified format.
	 * 
	 * @param {number} log_level_index: Optional. Sets the "log_level_index" property.
	 *
	 * @default {object} stream: process.env.stdout
	 * @default {number} log_level_index: 3 // which is "info".
	 */
	constructor(log_file_path?: any, log_level_index?: number) {
		if (log_file_path === ("STDOUT" || 1)) {
			this.stream = this.STDOUT;
		}
		else if (log_file_path === ("STDERR" || 2)) {
			this.stream = this.STDERR;
		}
		else if (typeof log_file_path === "string") {
			this.stream = fs.createWriteStream(log_file_path, {flags: "a", encoding: "utf8", mode: 0666});
		}
		else if ((typeof log_file_path === "object") && ("write" in log_file_path)) {
			this.stream = log_file_path;
			this.stream.write("\n");
		}
		else {
			this.stream = this.STDOUT;
		}
		this.log_level_index = log_level_index || this.DEFAULT_LEVEL;
		this.levels.forEach(level => {
			this[level] = function() {
				let args = makeArray(arguments);
				args.unshift(level);
				return this.log.apply(this, args);
			}
		});
	}

	/**
	 * The stream used in this function is defined in the constructor.
	 * : You can pass an object that implements "write" or
	 * : in it's prototype.
	 *
	 * @param {string} text: the text to write to the stream.
	 */
	protected write(text): void {
		this.stream.write(text);
	}

	/**
 	 * The default log formatting function.
 	 * @param {int} level: a number between 1 ~ 5.
 	 * @param {string} date: Default format is "Sat Jun 2010 01:12:05 GMT-0400 (EDT)".
 	 * @param {string} message: The message defined by the caller.
 	 * @return {string} output: log message.
 	 * 
 	 * The default format looks like:
 	 *  - "error [Sat Jun 12 2010 01:12:05 GMT-0400 (EDT)] message ..."
 	 */
	public format(level: string, date: Date, message: string): string {
		return [level, ' [', date, '] ', message].join('');
	}

	/**
 	 * Sets the maximum log level. The default level is "info" or 4.
 	 * @param {int} new_level: a number between 1 ~ 5.
 	 * @return {boolean} success: returns true when the new_level is successfully set, otherwise false.
 	 */
	public setLevel(new_level: string | number): number | boolean  {
		if ((typeof new_level === "number") && (this.levels[new_level - 1] !== undefined)) {
			this.log_level_index = new_level - 1;
			return this.log_level_index;
		}
		if ((typeof new_level === "string") && (this.levels.indexOf(new_level.toLowerCase()) !== -1)) {
			this.log_level_index = this.levels.indexOf(new_level.toLowerCase());
			return this.log_level_index;
		}
		else {
			return false;
		}
	}

	/**
	 *
	 */
	public log(): string | boolean {
		let args = makeArray(arguments);
		let message = "";
		let log_index = (this.levels.indexOf(args[0]) !== -1) ? args[0] : this.log_index_level;
		if (log_index > this.log_level_index) {
			return false;
		} else {
			args.forEach(arg => {
				if (typeof arg === "string") {
					message += " " + arg;
				} else {
					message += " " + util.inspect(arg, false, null);	
				}
			});
			message = this.format(this.levels[log_index], new Date(), message);
			this.write(message + "\n");
			return message;
		}
	}
}

const DefaultLogger = Logger();

/**
 * The default log formatting function.
 * @param {int} level: a number between 1 ~ 5.
 * @param {string} date: Default format is "Sat Jun 2010 01:12:05 GMT-0400 (EDT)".
 * @param {string} message: The message defined by the caller.
 * @return {string} output: log message.
 * 
 * The default format looks like:
 *  - "error [Sat Jun 12 2010 01:12:05 GMT-0400 (EDT)] message ..."
 */
Logger.prototype.format = function(level, date, message) {
	return [level, ' [', date, '] ', message].join('');
};

/**
 * Sets the maximum log level. The default level is "info" or 3.
 * @param {int} new_level: a number between 1 ~ 5.
 * @return {boolean} success: returns true when the new_level is successfully set, otherwise false.
 */
Logger.prototype.setLevel = function(new_level) {
  var index = Logger.levels.indexOf(new_level);
  return (index != -1) ? this.log_level_index = index : false;
};

// The base logging method. If the first argument is one of the levels, it logs
// to that level, otherwise, logs to the default level. Can take `n` arguments
// and joins them by ' '. If the argument is not a string, it runs `sys.inspect()`
// to print a string representation of the object.
Logger.prototype.log = function() {
  var args = makeArray(arguments),
      log_index = Logger.levels.indexOf(args[0]),
      message = '';

  // if you're just default logging
  if (log_index === -1) { 
    log_index = this.log_level_index; 
  } else {
    // the first arguement actually was the log level
    args.shift();
  }
  if (log_index <= this.log_level_index) {
    // join the arguments into a loggable string
    args.forEach(function(arg) {
      if (typeof arg === 'string') {
        message += ' ' + arg;
      } else {
        message += ' ' + sys.inspect(arg, false, null);
      }
    });
    message = this.format(Logger.levels[log_index], new Date(), message);
    this.write(message + "\n");
    return message;
  }
  return false;
};

Logger.levels.forEach(function(level) {
  Logger.prototype[level] = function() {
    var args = makeArray(arguments);
    args.unshift(level);
    return this.log.apply(this, args);
  };
});

exports.Logger = Logger;
exports.createLogger = function(log_file_path) {
  return new Logger(log_file_path);
};
