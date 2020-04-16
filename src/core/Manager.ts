import CanManage from '../contracts/CanManage';
import Helper from './Helper';

import {
  ActionRegister,
  ActionService,
  ActionResponseService,
  ActionDown,
  ActionLog
} from '../concerns';

import {
  createServer,
  Socket,
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
      if(Helper.isJson(payload.toString())) {
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
        if (isService) ActionRegister(data, this.services);
        break;
      case 'response data service':
        if (isService) ActionResponseService(data, this.clients);
        break;
      case 'data service':
        if (!isService) ActionService(data, this.services, actualConnection);
        break;
      case 'down':
        if(!isService) ActionDown(data, this.services, actualConnection, this);
        break;
      case 'log':
        if(!isService) ActionLog(data, actualConnection, this.services, this);
        break;
      default:
        break;
    }
  }

}
