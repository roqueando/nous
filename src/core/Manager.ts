import CanManage from '../contracts/CanManage';
import { createServer, Socket, createConnection, Server } from 'net';

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
        const filtered = this.services.length > 0 ? this.services.filter(
          service => service && (this.toTitleCase(service.name) === this.toTitleCase(parsed.service)
        )) : [];

        // ACTION: register
        if(parsed.isService && parsed.action === 'register') {
          this.services.push({
            name: parsed.service,
            id: parsed.payload.id,
            port: parsed.payload.port
          });
        }

        // ACTION: response data service
        if(parsed.isService && parsed.action === 'response data service') {
          const filteredClients = this.clients.filter(client => parsed.payload.remotePort === client.remotePort);
          filteredClients[0].write(parsed.payload.result);
        }

        // ACTION: data service
        if(!parsed.isService && parsed.action === 'data service') {

          if(filtered.length > 0) {
            const node = filtered[Math.floor(Math.random() * filtered.length)]; // basic balance
            const service = createConnection({port: node.port});
            service.write(JSON.stringify({
              serviceId: node.id,
              payload: {
                action: parsed.payload.action,
                remotePort: connection.remotePort,
                parameters: parsed.payload.parameters
              }
            }));
          }
        }
      } else {
        console.error("Data received is not a JSON");
      }
    });
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
