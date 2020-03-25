import Service from '../core/Service'
import Serviceable from '../contracts/Serviceable'

export default class Testing extends Service implements Serviceable {

    public hello(name: string) {
        return ("Coe " + name);
    }
}
