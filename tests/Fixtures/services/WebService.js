const {Service} = require('../../../dist');
const router = require('./routes/routeTest');

class WebService extends Service { 

    constructor(port) {
        super(port, router);
        this.type = this.HTTP;

    }
}

module.exports = WebService;
