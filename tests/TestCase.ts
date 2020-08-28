import {Manager, Service, Client} from "../src/index";
import * as path from 'path';

export default class TestCase {
  public services: Array <Service> = []; 
  public manager: Manager; 
  public managerPort: number = 8080;
  protected SERVICE_PATH = path.resolve(__dirname, './Fixtures/services');
  public client: Client = new Client();

  public init() {
    this.manager = new Manager(this.managerPort);
    this.manager.run();
  }

  public down() {
    this.services.forEach(service => service.down());
    this.manager.down();
    this.client.socket.destroy()
  }

  public async loadFixtureService(serviceName: string): Promise<Service> {
    const Service = await import(`${this.SERVICE_PATH}/${serviceName}.ts`);
    const service = new Service.default();

    service.setName(serviceName);
    this.services.push(service)
    service.run();

    return service;
  }
}
