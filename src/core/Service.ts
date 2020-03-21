import CanService from '../contracts/CanService';
import Messenger from './Messenger';
import { createServer, AddressInfo  } from 'net'; 
import crypto from 'crypto';

export default class Service implements CanService {

    protected NODE: string = 'node';
    protected HTTP: string = 'http';
    protected type: string = this.NODE;
    protected id: string;

    private static instance: Service;

    public server: any = createServer();
    public instance: Service;
    public ignore: boolean = false;
    public name: string;
    public port: number;
    public relativePort: number;

    public messenger: Messenger = Messenger.getInstance();

    constructor(port: number = null) {
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

    static getInstance(): Service {
        if(!Service.instance) {
            Service.instance = new Service();
        }
        return Service.instance;
    }

    public register(port: number = null): void {
        const hash = crypto.createHash('sha1');
        hash.update(Math.floor(Math.random()).toString());
        this.id = hash.digest('hex');
        this.port = port;
        this.messenger.emit('service manager register', {
            service: this.name,
            action: 'register',
            payload: {
                id: this.id,
                ports: [port]
            }
        });
    }

    public async run(): Promise<Service> {
        
        if(this.type === this.NODE) {

            this.server.listen(this.port || null, () => {
                console.log(`Service connected on port: ${this.server.address().port}`);
            });
            this.register(this.server.address().port);
        }

        if(this.type === this.HTTP) {
            // create http server
        }

        return this;
    }

}
