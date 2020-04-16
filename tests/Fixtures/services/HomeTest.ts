import Service from '../../../src/core/Service'
import Serviceable from '../../../src/contracts/Serviceable'
import * as json from './db/db.json';

export default class HomeTest extends Service implements Serviceable {

    public hello(name: string) {
        return ("Hello " + name);
    }

    public getJson() {
        return json;
    }

    public getBool(): boolean{
        return true;
    }
}
