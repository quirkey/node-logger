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


function makeArray(nonarray: any): Array<any> { 
 	return Array.prototype.slice.call(nonarray); 
};

/**
 * Interface for "Logger.stream" object. Called by "Logger.prototype.log()".
 * : Logger.stream can be set to anything that has implements "write" in it's object or prototype. 
 *
 * @param {string} text: String to write to "stdout | stderr | logfile".
 */
interface WritableLogStream {
	write(text: string): any;
}

/**
 * For reference in Logger constructor.
 */
type FileDescriptor = 1 | 2;
type LogLevels = "fatal" | "error" | "warn" | "info" | "debug" | 1 | 2 | 3 | 4 | 5;

/**
 * 
 */
class Logger {
	
	levels = ["fatal", "error", "warn", "info", "debug"];
	stream: WritableLogStream;
	log_level_index: number;
	log_level_default = 3;

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
	constructor(log_file_path?: string | FileDescriptor | WritableLogStream, log_level?: LogLevels) {
		if (log_file_path === 1 || log_file_path === "STDOUT") {
			this.stream = process.stdout;
		}
		else if (log_file_path === 2 || log_file_path === "STDERR") {
			this.stream = process.stderr;
		}
		else if (typeof log_file_path === "string") {
			this.stream = fs.createWriteStream(log_file_path, {flags: "a", encoding: "utf8", mode: parseInt("0666", 10)});
		}
		else if ((typeof log_file_path === "object") && ("write" in log_file_path)) {
			this.stream = log_file_path;
			this.stream.write("\n");
		}
		else {
			this.stream = process.stdout;
		}
		this.log_level_index = typeof log_level === "string" ? this.levels.indexOf(log_level) : log_level || this.log_level_default;
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
	 * Calls "this.stream.write()" with newline appended.
	 * @return {string} message: log message with newline appended.
	 */
	public log(): string | boolean {
		let args = makeArray(arguments);
		let message = "";
		let log_index = (this.levels.indexOf(args[0].toLowerCase()) !== -1) ? this.levels.indexOf(args[0]) : this.log_level_index;
		if (log_index > this.log_level_index) {
			return false;
		} else {
			args.shift();
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

	public fatal() {
		let args = makeArray(arguments);
		args.unshift("fatal");
		return this.log.apply(this, args);
	}

	public error() {
		let args = makeArray(arguments);
		args.unshift("errors");
		return this.log.apply(this, args);
	}
	
	public warn() {
		let args = makeArray(arguments);
		args.unshift("warn");
		return this.log.apply(this, args);
	}

	public info() {
		let args = makeArray(arguments);
		args.unshift("info");
		return this.log.apply(this, args);
	}
	
	public debug() {
		let args = makeArray(arguments);
		args.unshift("debug");
		return this.log.apply(this, args);
	}
	
}

exports.Logger = Logger;
exports.createLogger = function(log_file_path) {
	return new Logger(log_file_path);
};
