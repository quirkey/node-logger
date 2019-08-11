class ConsoleTransport {

    constructor(options={nextTick:false}) {
        this.delayed = options.nextTick;
    }

    write(message) {
        if(this.delayed) {
            process.nextTick(()=>process.stdout.write(message));
        } else {
            process.stdout.write(message);
        }
    }

}

module.exports = ConsoleTransport;