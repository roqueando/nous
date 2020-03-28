
import Service from '../../../src/core/Service'
import Serviceable from '../../../src/contracts/Serviceable';

export default class SecondTest extends Service implements Serviceable { 

    public say(name: string) { 
        return ("Aloha " + name); 
    }
}
