const {Service} = require('../../../dist');
const router = require('./routes/routeTest');

class WebService extends Service { 

    constructor(port) {
        super(port, router);
        this.type = this.HTTP;

        this.router.register("POST", '/say', this.say);
    }
    
    say(req, res) { 
        req.on('data', data => {
            const {name} = router.parse(data.toString());
            res.write(`Aloha ${name}`);
        })
    }
}

module.exports = WebService;
