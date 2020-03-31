import Messenger from './Messenger';
import { createServer, AddressInfo, createConnection, Socket  } from 'net'; 
import {Emitter} from './Emitter';

export default class Service {

    /** @var String NODE
     * Service TCP node
     */
    protected NODE: string = 'node';

    /** @var String HTTP
     * Service HTTP node
     */
    protected HTTP: string = 'http';

    /** @var String type
     * Service type. Default NODE
     */
    protected type: string = this.NODE;

    /** @var String id
     * Service identification
     */
    public id: string = '';

    /** @var Socket socket
     * Servic connction with Manager
     */
    public socket: Socket = createConnection(8080);

    /** @var Service instance **/
    private static instance: Service;

    /**
     * @var Server server
     * Handles all tcp packet
     * and return to Manager
     */
    public server: any = createServer((connection) => {
        connection.on('data', data => {
            if(this.isJson(data.toString())) {
                const parsed = JSON.parse(data.toString());

                if(parsed.serviceId === this.id) {
                    const result = this[parsed.payload.action](...parsed.payload.parameters);
                    this.socket.write(JSON.stringify({
                        result,
                        remotePort: parsed.payload.remotePort
                    }))
                }
            }else {
                console.error("[SERVICE] Data is not a JSON");
            }
        });
    });

    /** @var Bool ignore
     * Set true to not run this service first
     * and run only manual
     */
    public ignore: boolean = false;

    /** @var String name 
     * Service name
     */
    public name: string = '';

    /** @var Number port
     * Service port
     */
    public port: number;

    /** @var Bool isRunning **/
    public isRunning: boolean = false;

    /** @var Bool isRegistered **/
    public isRegistered: boolean = false;

    constructor(port: number = 0) {
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

    public register(port: number = 0): void {
        this.id = '_' + Math.random().toString(36).substr(2, 9);
        this.port = port;

        this.socket.write(JSON.stringify({
            service: this.name,
            action: 'register',
            payload: {
                id: this.id,
                port: port
            }
        }));
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

    private isJson(string: string): boolean {
        try {
            JSON.parse(string);
        } catch (e) {
            return false;
        }
        return true;
    }
}
