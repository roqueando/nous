
import Service from '../../../src/core/Service'
import Serviceable from '../../../src/contracts/Serviceable'

export default class HomeTest extends Service implements Serviceable {

    public hello(name: string) {
        return ("Hello " + name);
    }
}
