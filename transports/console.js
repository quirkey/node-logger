class ConsoleTransport {

    constructor(options={nextTick:false}) {
        this.delayed = options.nextTick;
    }

    write(message,level,logger) {
        const stream = ['emerg','alert','crit','error'].indexOf(level) !== -1 ? 'stderr' : 'stdout';
        if(this.delayed) {
            process.nextTick(()=>process[stream].write(message));
        } else {
            process[stream].write(message);
        }
    }

}

module.exports = ConsoleTransport;