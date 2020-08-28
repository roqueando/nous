import {createConnection, Socket} from 'net';
import {ClientPayload, DataService} from '../typos';

export default class Client {
  public host: string;
  public port: number;
  public socket: Socket;

  constructor(host: string = '127.0.0.1', port: number = 8080) {
    this.host = host;
    this.port = port;
    this.socket = createConnection({host: this.host, port: this.port});
  }

  public send(service: string, payload: ClientPayload): Promise<any> {
    const data: DataService = {
      service,
      action: "data service",
      isService: false,
      remotePort: null,
      payload
    };
    return new Promise((resolve, reject) => {
      this.socket.write(JSON.stringify(data));
      this.socket.on('data', payload => {
        resolve(JSON.parse(payload.toString()))
      });
      this.socket.on('error', err => reject(err));
    })
  }
  protected destroy(): void {
    this.socket.destroy();
  }
}
