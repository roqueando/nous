import {
  createServer,
  createConnection,
  Socket,
  Server
} from 'net';
import Helper from './Helper';

import {
  createServer as createHTTP,
  RequestOptions,
  ServerResponse
} from 'http';
import {parse} from 'querystring';

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

  /** @var Number managerPort
   * Manager general PORT number
   */
  public managerPort: number = 8080;

  /** @var String id
   * Service identification
   */
  public id: string = '';

  /** @var Socket socket
   * Servic connction with Manager
   */
  public socket: Socket = createConnection({ port: this.managerPort  });

  /** @var {Number} quantity of nodes */
  protected quantity: number = 1;

  /**
   * @var Server server
   * Handles all tcp packet
   * and return to Manager
   */
  public server: any = createServer(connection => this.handleConnection(connection));

  public HTTPServer: any = createHTTP(this.handleHTTPRequest);

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

  /** setName
   * @param {String} name
   * @return {Service}
   * @description Set the service name
   */
  public setName(name: string): Service {
    this.name = name;
    return this;
  }

  /** down
   * @return {void}
   * @description Close the server
   */
  public down(): void {
    this.server.close();
    this.isRunning = false;
  }

  /** Register
   * @param {Number} port Server port
   * @return {void}
   * @description Send a packet to Manager server
   */
  public register(port: number = 0): void {
    this.id = '_' + Math.random().toString(36).substr(2, 9);
    this.port = port;

    if(this.socket.connecting) {
      this.socket.write(JSON.stringify({
        service: this.name,
        action: 'register',
        isService: true,
        payload: {
          id: this.id,
          port: port,
          host: JSON.stringify(this.server.address())
        }
      }));
    }
    this.isRegistered = true;
  }

  /** Run
   * @return {Service}
   * @description Run the service to a TCP or HTTP node
   */
  public run(): Service {
    if(this.type === this.NODE) {
      this.server.listen(this.port || null);
      this.register(this.server.address().port);
      this.isRunning = true;
    }

    if(this.type === this.HTTP) {
      // create http server
      this.HTTPServer.listen(this.port || null);
      this.register(this.HTTPServer.address().port);
      this.isRunning = true;
    }
    return this;
  }

  protected handleConnection(connection: Socket) {
    connection.on('data', data => {
      if(Helper.isJson(data.toString())) {
        const parsed = JSON.parse(data.toString());
        if(parsed.action == 'down') {
          this.down();
        }
        if(parsed.serviceId === this.id) {
          const result = this[parsed.payload.action](...parsed.payload.parameters);
          this.socket.write(JSON.stringify({
            service: this.name,
            action: 'response data service',
            isService: true,
            payload: {
              result,
              remotePort: parsed.payload.remotePort
            }
          }))
        }
      }else {
        console.error("[SERVICE] Data is not a JSON");
      }
    });
  }

  protected handleHTTPRequest(request: any, response: any) {
    switch(request.method) {
      case 'GET':
        //TODO: get path and hit on service function
        //      if have parameters like POST below
        //      pass to function parameters.
        response.write('Heelo');
        break;
      case 'POST':
        request.on('data', (chunk: any) => {
          const parsed = parse(chunk.toString());
          // TODO: response correctly
          response.write('teste');
          response.end();
        })
        break;
      case 'PUT':
        break;
      case 'DELETE':
        break;
      default:
        response.setHeader("Content-Type", "application/json");
        return response.write({error: "Only request GET, POST, PUT, DELETE"}).end();
    }
  }

  public getQuantity(): number {
    return this.quantity;
  }

  public getType() {
    return this.type;
  }
}
