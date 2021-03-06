const {Service} = require('../../../dist');
const json = require('./db/db.json');

class HomeTest extends Service {

    hello(name) {
        return ("Hello " + name);
    }

    getJson() {
        return json;
    }

    getBool(){
        return true;
    }

    async asynchronousFunc() {
        return "Running async";
    }
}

module.exports = HomeTest;
