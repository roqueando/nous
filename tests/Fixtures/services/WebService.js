const {Service} = require('../../../dist');
const router = require('./routes/routeTest');

class WebService extends Service { 

    constructor(port) {
        super(port, router);
        this.type = this.HTTP;

        this.router.register("POST", '/say', this.say);
    }
    
    say(req, res) { 
        const { name } = req.body;
        res.write(`Aloha ${name}`);
    }
}

module.exports = WebService;
