import Messenger from './Messenger';
import { createServer, AddressInfo  } from 'net'; 
import {Emitter} from './Emitter';

export default class Service {

    protected NODE: string = 'node';
    protected HTTP: string = 'http';
    protected type: string = this.NODE;
    public id: string = '';

    private static instance: Service;

    public server: any = createServer();
    public ignore: boolean = false;
    public name: string = '';
    public port: number;
    public isRunning: boolean = false;
    public isRegistered: boolean = false;

    public messenger: Messenger = Messenger.getInstance();

    constructor(port: number = 0) {
        this.port = port;

        Emitter.on('data service', (data: any) => {
            if(data.serviceId === this.id) {
                //@ts-ignore
                const result = this[data.payload.action](...data.payload.parameters);
                this.messenger.sendToManager(result, data.payload.remotePort);
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

    public register(port: number = 0): void {
        this.id = '_' + Math.random().toString(36).substr(2, 9);
        this.port = port;
        Emitter.emit('service manager register', {
            service: this.name,
            action: 'register',
            payload: {
                id: this.id,
                ports: [port]
            }
        });
        this.isRegistered = true;
    }

    public run(): Service {
        if(this.type === this.NODE) {
            this.server.listen(this.port || null);
            this.register(this.server.address().port);
            this.isRunning = true;
        }

        if(this.type === this.HTTP) {
            // create http server
        }
        return this;
    }
}
