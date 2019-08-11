// name: simple-logger
// version: 0.0.1
// http://github.com/quirkey/node-logger
// forked by Garrett Morris
/*
Copyright (c) 2010 Aaron Quint, 2019 Garrett Morris
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

const debug = m => process.stdout.write(m+"\n")

const colors = require('colors/safe');
const util = require('util');

function isFormattableString( args ) {
    // debug(args);
    if(!args.length) return false;
    if(typeof args[0] !== 'string') return false;
    if( args[0].includes('%s') || args[0].includes('%d') || args[0].includes('%i') || args[0].includes('%f') || args[0].includes('%j') || args[0].includes('%o') || args[0].includes('%O') ) {
        return true;
    }
    return false;
}

//pad string to specified length. used to keep messages aligned nicely
const pad = (str,len) => str + new Array(len - str.length).fill(' ').join('');

const dateFormatter = d=> d.toLocaleString('en-US');

class Logger {

    constructor(options={log_level:'debug',transports:['console'],formatDate:false}) {
        this.setLevel(options.log_level);
        this.setTransports(options.transports);
        this.setDateFormat(options.formatDate||dateFormatter);
    }

    getIndex(k){ 
        if(!this.hasOwnProperty('_keys')) {
            this._keys = Object.keys(this.levels).reverse();
        }
        return this._keys.indexOf(k)
    }

    setLevel(new_level) {
        if(!this.levels.hasOwnProperty(new_level)){
            throw new Error('invalid log_level ('+new_level+') supplied.');
        }
        this.log_level = new_level;
        this.log_level_index = this.getIndex(this.log_level);
        // debug(this.log_level);
        // debug(this.log_level_index);
    }

    setTransports(transports) {
        if(!Array.isArray(transports)){
            throw new Error('transports must be an array.');
        }
        this.transports = transports.map(transport=>{
            if(typeof transport==='string') {
                try {
                    var Transport = require('./transports/'+transport);
                    return new Transport;
                }
                catch(err){
                    throw new Error('Unknown built-in transport named `'+transport+'`. ');
                }
            }
            if(typeof transport === 'object') {
                if(transport.write && typeof transport.write==='function'){
                    return transport;
                }else{
                    throw new Error('invalid transport provided ('+transport.name+'). Transports must be an object with a function called `write`');
                }
            }
        })
    }

    setDateFormat(fn) {
        // debug(fn);
        this.formatDate = fn;
    }

    write(text,level) {
        this.transports.forEach(transport=>transport.write(text,level,this));
    }

    format(level, date, message) {
        // debug(level);
        // debug(this.levels[level]);
        return [ colors[ this.levels[level] ](pad(level,7)), ' [', this.formatDate(date), '] ', message ].join('');
    }

    log(...args) {
        // debug(Array.isArray(args));
        if(!args.length){
            return;
        }
        const log_level = this.levels.hasOwnProperty(args[0]) ? args.shift() : 'info';
        const index = this.getIndex(log_level);
        let message = '';
        // debug(log_level);
        // debug(index);
        if (index >= this.log_level_index) {
            if( isFormattableString(args) ) {
                // debug('logger: formatting message');
                message = util.format(...args);
            }else{
                // join the arguments into a loggable string
                args.forEach(arg=> {
                    if (typeof arg === 'string') {
                        message += ' ' + arg;
                    } else {
                        message += ' ' + util.inspect(arg, false, null);
                    }
                });
            }
            
            message = this.format(log_level, new Date(), message);
            this.write(message + "\n",log_level);
            return message;
        }else{
            // debug("miss\n")
        }
        return false;
    }

}

Logger.prototype.levels = {
    emerg:'red',
    alert: 'red',
    crit: 'red',
    error: 'red',
    warning:'yellow',
    notice:'cyan',
    info:'cyan',
    debug:'cyan'
};

function createLogger(options={}) {
    const logger = new Logger(options);
    const log = (...args) => {
        logger.log('info',...args);
    };
    Object.keys(logger.levels).forEach(level=>log[level] = (...args) => logger.log(level,...args));
    log.logger = logger;
    return log;  
}

var old = {};
var isWrapped = false;

function wrapConsole( logger ) {
    if(!isWrapped) {
        var c = global.console;
        old.log = c.log;
        old.warn = c.warn;
        old.error = c.error;
        old.info = c.info;
        c.log = logger.info;
        c.warn = logger.warning;
        c.error = logger.error;
        c.info = logger.info;
        isWrapped = true;
    }
}

function unwrapConsole() {
    if(isWrapped) {
        var c = global.console;
        c.log = old.log;
        c.warn = old.warn;
        c.error = old.error;
        c.info = old.info;
        old = {};
        isWrapped = false;
    }
}


module.exports = {createLogger,Logger,wrapConsole,unwrapConsole,isFormattableString};