import CanManage from '../contracts/CanManage';
import { createServer, Socket, createConnection, Server } from 'net';

export default class Manager implements CanManage {

  public services: Array<any> = [];
  public clients: Array<Socket> = [];
  public port: number;
  public server: Server = createServer((connection) => {
    connection.on('data', payload => {
      if(this.isJson(payload.toString())) {
        const parsed = JSON.parse(payload.toString());
        if(!parsed.isService) {
          this.clients.push(connection);
        }
        const filtered = this.services.length > 0 ? this.services.filter(
          service => service && (this.toTitleCase(service.name) === this.toTitleCase(parsed.service)
        )) : [];

        if(parsed.isService && parsed.action === 'register') {
          this.services.push({
            name: parsed.service,
            id: parsed.payload.id,
            port: parsed.payload.port
          });
        }
        if(parsed.isService && parsed.action === 'response data service') {
          const filteredClients = this.clients.filter(client => parsed.payload.remotePort === client.remotePort);
          filteredClients[0].write(parsed.payload.result);
        }
        if(!parsed.isService && parsed.action === 'data service') {
          if(filtered.length > 0) {
            filtered.forEach(item => {
              const service = createConnection({port: item.port});
              service.write(JSON.stringify({
                serviceId: item.id,
                payload: {
                  action: parsed.payload.action,
                  remotePort: connection.remotePort,
                  parameters: parsed.payload.parameters
                }
              }));
            });
          }
        }
      } else {
        console.error("Data received is not a JSON");
      }
    });
  });
  ;

  constructor(port: number) {
    this.port = port;
    return this;
  }

  public down(): void {
    this.server.close();
  }

  public run(): void {
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
