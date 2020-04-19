import {createConnection, Socket} from 'net';
import {DataService} from '../typos';

export default class Client {
  public host: string;
  public port: number;
  public socket: Socket;

  constructor(host: string = '127.0.0.1', port: number = 8080) {
    this.host = host;
    this.port = port;
    this.socket = createConnection({host: this.host, port: this.port});
  }

  public send(data: DataService): Promise<any> {
    return new Promise((resolve, reject) => {
      this.socket.write(JSON.stringify(data));
      this.socket.on('data', payload => {
        resolve(JSON.parse(payload.toString()))
      });
      this.socket.on('error', err => reject(err));
    })
  }
}
