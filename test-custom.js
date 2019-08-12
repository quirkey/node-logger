const {createLogger} = require('./logger');

var T1 = {
    write:function(message,level,logger) {
        console.log(message);
    }
};

var T2 = {
    writeCustom:function(args,level,date,logger) {
        console.log({
            level,
            date: date.getTime(),
            args,
        });
    }
}

const log = createLogger({debug:true,transports:[T1,T2]});



log('now my messages are delayed until next tick');