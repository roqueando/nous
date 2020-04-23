import Service from '../../../src/core/Service'
import Serviceable from '../../../src/contracts/Serviceable';

export default class WebService extends Service implements Serviceable { 

    type = this.HTTP;
    public say(name: string) { 
        return ("Aloha " + name); 
    }
}
