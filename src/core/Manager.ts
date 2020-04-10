import CanManage from '../contracts/CanManage';

import {
  Register,
  DataService,
  ResponseService,
  DownService
} from '../typos';

import Token from './Token';

import {
  createServer,
  Socket,
  createConnection,
  Server
} from 'net';

export default class Manager implements CanManage {

  /**  @var {Array} services **/
  public services: Array<any> = [];

  /** @var {Array<Socket>} clients **/
  public clients: Array<Socket> = [];

  /** @var {Number} port **/
  public port: number;

  /** @var {Server} server **/
  public server: Server = createServer((connection) => this.handleConnection(connection));

  constructor(port: number) {
    this.port = port;
    return this;
  }

  /** down
   * @function down
   * @description closes the server
   * @returns {void}
   */
  public down(): void {
    this.server.close();
  }

  /**
   * run
   * @function run
   * @description initiate the server
   * @returns {void}
   */
  public run(): void {
    this.server.listen(this.port);
  }

  /**
   * getServices
   * @function getServices
   * @description returns all registered services
   * @returns {Array<any>}
   */
  public getServices(): Array<any> {
    return this.services;
  }

  /**
   * handleConnection
   * @function handleConnection
   * @description that listener will handle all message
   *  through manager connections and services
   */
  protected handleConnection(connection: Socket) {
    connection.on('data', payload => {
      if(this.isJson(payload.toString())) {
        const parsed = JSON.parse(payload.toString());
        // when is client, save client
        if(!parsed.isService) {
          this.clients.push(connection);
        }
        this.action(parsed.isService, parsed.action, parsed, connection);
      } else {
        console.error("Data received is not a JSON");
      }
    });
  }

  /**
   * @function action
   * @private
   * @param {Boolean} isService
   * @param {String} action
   * @param {Any} data
   * @returns {void}
   * @description Each action which pass, will execute some cases
   *  and will be validated by own typos.
   */
  private action(isService: boolean, action: string, data: any, actualConnection: Socket): void {
    switch(action) {
      case 'register':
        if (isService) this.actionRegister(data);
        break;
      case 'response data service':
        if (isService) this.actionResponseDataService(data);
        break;
      case 'data service':
        if (!isService) this.actionDataService(data, actualConnection);
        break;
      case 'down':
        if(!isService) this.actionDownService(data, actualConnection);
      default:
        break;
    }
  }

  private actionDownService(data: DownService, conn: Socket): void {
    const verified = Token.verify(data.payload.from);
    if(verified) {
      this.services.forEach(item => {
        const socket = createConnection({port: item.port});
        socket.write(JSON.stringify({
          action: 'down',
        }));
      })
    }
  }

  /**
   * @function actionRegister
   * @private
   * @param {Register} data
   * @returns {void}
   * @description Register a service into Manager's service list.
   */
  private actionRegister(data: Register): void {
    this.services.push({
      name: data.service,
      id: data.payload.id,
      port: data.payload.port
    });
  }

  /**
   * @function actionDataService
   * @private
   * @param {DataService} data
   * @returns {void}
   * @description Get the payload from client and sends
   * to service.
   */
  private actionDataService(data: DataService, conn: Socket): void {
    const filtered = this.services.length > 0
      ? this.services.filter(
        service => service && (this.toTitleCase(service.name) === this.toTitleCase(data.service))
      )
        : [];

    if(filtered.length > 0) {
      const node = filtered[Math.floor(Math.random() * filtered.length)]; // basic balance
      const service = createConnection({port: node.port});
      service.write(JSON.stringify({
        serviceId: node.id,
        payload: {
          action: data.payload.action,
          remotePort: conn.remotePort,
          parameters: data.payload.parameters
        }
      }));
    }
  }

  /**
   * @function actionResponseDataService
   * @private
   * @param {ResponseService} data
   * @returns {void}
   * @description Write a tcp packet to the client
   */
  private actionResponseDataService(data: ResponseService): void {
    const filteredClients = this.clients.filter(client => data.payload.remotePort === client.remotePort);
    filteredClients[0].write(data.payload.result);
  }

  /** @private
   * @function isJson
   * @description check if string is a JSON
   * @returns {Boolean}
   */
  private isJson(string: string): boolean {
    try {
      JSON.parse(string);
    } catch (e) {
      return false;
    }
    return true;
  }

  /**
   * @private
   * @function toTitleCase
   * @description puts string on title case
   * @returns {string}
   */
  private toTitleCase(str: string): string {
    return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
  }
}
