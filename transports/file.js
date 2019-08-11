const fs = require('fs');
const path = require('path');
const {stripColors} = require('colors/safe');

class FileTransport {

    constructor(options={nextTick:false,combined:false,error:false}) {
        this.delayed = options.nextTick;

        if(!options.combined&&!options.error) {
            const dir = process.cwd();
            var combinedPath = dir+'/combined.log';
            var errorPath = dir+'/error.log';
        }
        
        try{
            this.combined = fs.createWriteStream(combinedPath,{ flags: 'a' });
            this.error = fs.createWriteStream(errorPath, { flags: 'a' });    
        }
        catch(err){
            err.message = 'FileTransport is unable to open log files for writing. '+err.message;
            throw err;
        }

    }

    internalWrite(stream,message) {
        try{
            message = stripColors(message);
            if(!Buffer.isBuffer(message)){
                message = Buffer.from(message,'utf8');
                this.delayed ? process.nextTick(()=>stream.write(message)) : stream.write(message);
            }    
        }
        catch(err){
            process.stderr.write(err.toString());
        }
    }

    write(message,level,logger) {
        if(logger.isError(level)) {
            this.internalWrite(this.error,message);
        }
        this.internalWrite(this.combined,message);
    }

}

module.exports = FileTransport;