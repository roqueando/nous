import { createServer } from 'net';

export default class Server {
    public host: string;
    public port: number;
    protected NODE: string = 'node';
    protected HTTP: string = 'http';
    public type: string;
    public serverType: string;
    protected server: any;

    constructor(host: string, port: number) {
        this.host = host;
        this.port = port === 0 ? 0 : port;
        return this;
    }

    public setType(type: string): any {
        this.type = type;
        return this;
    }

    public setServerType(type: string): any {
        this.serverType = type;
        return this;
    }

    public down(): void {
        this.server.close(); 
    }

    public run(): any {
        
        if(this.type === this.NODE) {
            // create a tcp server;
            this.server = createServer();
            this.server.listen(this.port, () => {
                console.log(`server connected on: ${this.host}:${this.port}`);
            });
        }

        if(this.type === this.HTTP) {
            // create http server
        }

        return this;
    }
}
