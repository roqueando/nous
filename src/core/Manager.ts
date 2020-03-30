import CanManage from '../contracts/CanManage';
import Messenger from './Messenger';
import { createServer, AddressInfo, Socket  } from 'net';
import * as fs from 'fs';
import * as path from 'path';

export default class Manager implements CanManage {

    public services: Array<any> = [];
    public messenger: Messenger = Messenger.getInstance();
    public port: number;
    public server: any;

    protected clients: Array<Socket> = [];
    protected servicesPath: string = path.resolve(__dirname, '../services');

    constructor(port: number) {
        this.port = port; 

        this.messenger.on('data manager', payload => {
            this.clients.forEach(client => {
                if(client.remotePort === payload.remotePort) {
                    client.write(payload.payload);
                }
            });
        });
        return this;
    }

    public down(): void {
        this.server.close(); 
    }

    public static serviceUp() {
        const files = fs.readdirSync(`${process.cwd()}/services`)
        .filter((file) => {
            return file !== '.gitkeep';
        });
        files.forEach(item => {
            const file = require(`${process.cwd()}/services/${item}`);
            const [className] = item.split('.');
            const service = new file.default();
            service.setName(className);
            service.run();
        });
    }

    public upServicesListener(): void {
        this.messenger.on('service manager register', data => {
            this.services.push({
                id: data.payload.id,
                name: data.service,
                ports: data.payload.ports
            });
        });
    }

    public run(): void {
        this.server = createServer((connection) => {
            this.clients.push(connection);

            connection.on('data', payload => {
                if(this.isJson(payload.toString())) {
                    const parsed = JSON.parse(payload.toString());

                    const filtered = this.services.filter(
                        service => this.toTitleCase(service.name) === this.toTitleCase(parsed.service)
                    );
                    filtered.forEach((item) => {
                        this.messenger.send(item.id, {
                            action: parsed.action,
                            remotePort: connection.remotePort,
                            parameters: parsed.parameters
                        });
                    });
                } else {
                    console.error("Data received is not a JSON");
                }
            });
        });
        this.server.listen(this.port);
    }

    public getServices(): Array<string> {
        return this.services;
    }

    private isJson(string: string): boolean {
        try {
            JSON.parse(string);
        } catch (e) {
            return false;
        }
        return true;
    }

    private toTitleCase(str: string): string {
        return str.replace(
            /\w\S*/g,
            function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        );
    }
}
