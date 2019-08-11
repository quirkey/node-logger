class ConsoleTransport {

    constructor(options={nextTick:false}) {
        this.delayed = options.nextTick;
    }

    write(message,level,logger) {
        const stream = logger.isError(level) ? 'stderr' : 'stdout';
        if(this.delayed) {
            process.nextTick(()=>process[stream].write(message));
        } else {
            process[stream].write(message);
        }
    }

}

module.exports = ConsoleTransport;