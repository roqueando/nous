import Messenger from './Messenger';
import { createServer, AddressInfo  } from 'net'; 

export default class Service {

    protected NODE: string = 'node';
    protected HTTP: string = 'http';
    protected type: string = this.NODE;
    public id: string;

    private static instance: Service;

    public server: any = createServer();
    public ignore: boolean = false;
    public name: string;
    public port: number;

    public messenger: Messenger = Messenger.getInstance();

    constructor(port: number = null) {
        this.port = port;

        this.messenger.on('data service', data => {
            if(data.serviceId === this.id) {
                const result = this[data.payload.action](...data.payload.parameters);
                this.messenger.sendToManager(result);
            }
        });
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
        this.id = '_' + Math.random().toString(36).substr(2, 9);
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

    public run(): Service {
        if(this.type === this.NODE) {
            this.server.listen(this.port || null);
            this.register(this.server.address().port);
        }

        if(this.type === this.HTTP) {
            // create http server
        }
        return this;
    }

}
