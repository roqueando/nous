import CanManage from '../contracts/CanManage';
import Messenger from './Messenger';
import { createServer, AddressInfo  } from 'net';
import fs from 'fs';
import path from 'path';

export default class Manager implements CanManage {

    public services: Array<any> = [];
    public messenger: Messenger = Messenger.getInstance();
    public port: number;
    protected server: any;
    
    protected servicesPath: string = path.resolve(__dirname, '../services');

    constructor(port: number) {
        this.port = port; 
        this.messenger.on('data manager', payload => {
            //
        });
        return this;
    }

    public down(): void {
        this.server.close(); 
    }

    public upServices(): void {
        this.messenger.on('service manager register', data => {
            switch(data.action) {
                case 'register':
                    this.services.push({
                        id: data.payload.id,
                        name: data.service,
                        ports: data.payload.ports
                    });
                    break;
                default:
                    break;
            }
        });

        const files = fs.readdirSync(path.resolve(__dirname, '../services'));
        files.forEach(item => {
            const file = require(`${this.servicesPath}/${item}`);
            const [className] = item.split('.');
            const service = new file.default();
            service.setName(className);
            service.run();

        });
    }

    public run(): any {
        this.server = createServer();
        this.server.listen(this.port);
        return this;
    }

    public getServices(): Array<string> {
        return this.services;
    }
}
