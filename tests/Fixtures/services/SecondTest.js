const {Service} = require('../../../dist');

class SecondTest extends Service { 

    say(name) { 
        return ("Aloha " + name); 
    }
}

module.exports = SecondTest;
