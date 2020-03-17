import Server from './Server';
import CanService from '../contracts/CanService';
import { createConnection  } from 'net';

export default class Service extends Server implements CanService {

    public ignore: boolean = false;
    public name: string;

    constructor(host: string, port: number) {
        super(host, port);

        this.register();
    }

    public setName(name: string): Service {
        this.name = name;
        return this;
    }

    public register(): void {
       const socket = createConnection(8080);
       socket.emit('data', {
           service: this.name,
           action: 'connect',
           data: null
       });
       socket.destroy();
    }
}
