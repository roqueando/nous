import CanService from '../contracts/CanService';
import Messenger from './Messenger';
import { createServer, AddressInfo  } from 'net'; 

export default class Service implements CanService {

    protected NODE: string = 'node';
    protected HTTP: string = 'http';
    protected type: string = this.NODE;
    public server: any;

    public ignore: boolean = false;
    public name: string;
    public port: number;

    public messenger: Messenger = Messenger.getInstance();

    constructor(port: number) {
        this.port = port;
        return this;
    }

    public setName(name: string): Service {
        this.name = name;
        return this;
    }

    public down(): void {
        this.server.close();
    }

    public run(): any {
        
        if(this.type === this.NODE) {
            // create a tcp server;
            this.server = createServer();
            const address: AddressInfo = this.server.address();

            this.register();
            this.server.listen(this.port, () => {
                console.log(`Service connected on port: ${this.port}`);
            });
        }

        if(this.type === this.HTTP) {
            // create http server
        }

        return this;
    }
    public register(): void {
        this.messenger.emit('service manager register', {
            service: this.name,
            action: 'register',
            data: null
        });
    }
}
