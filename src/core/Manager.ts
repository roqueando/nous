import CanManage from '../contracts/CanManage';
import Messenger from './Messenger';
import { createServer, AddressInfo  } from 'net';
import fs from 'fs';
import path from 'path';
import { promisify  } from 'util'; 

export default class Manager implements CanManage {

    public services: Array<any> = [];
    public messenger: Messenger = Messenger.getInstance();
    public port: number;
    protected server: any;
    
    protected servicesPath: string = path.resolve(__dirname, '../services');

    constructor(port: number) {
        this.port = port; 
        return this;
    }

    public down(): void {
        this.server.close(); 
    }

    public async upServices(): Promise<Manager> {
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
        const readDir = promisify(fs.readdir);

        const files = await readDir(path.resolve(__dirname, '../services'));
        files.forEach(async item => {
            const file = await import(`${this.servicesPath}/${item}`);
            const [className] = item.split('.');
            
            file.default.getInstance().setName(className);
            await file.default.getInstance().run();
        });
        return this;
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
