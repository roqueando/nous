import { createServer } from 'net';

export default class Server {
    public host: string;
    public port: number;

    constructor(host: string, port: number) {
        this.host = host;
        this.port = port === 0 ? 0 : port;
        return this;
    }
    public run(): void {
       const server = createServer();
       server.listen(() => {
           console.log(`server connected on: ${this.host}:${this.port}`);
       });
    }
}

