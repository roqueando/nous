import * as fs from 'fs';
import * as path from 'path';
import Service from '../src/core/Service';
import Manager from '../src/core/Manager';

const SERVICE_PATH = path.resolve(__dirname, '../src/services');

const helpers = {
    SERVICE_PATH,
    firstFilename: path.resolve(SERVICE_PATH) + '/HomeTest.ts',
    secondFilename: path.resolve(SERVICE_PATH) + '/SecondTest.ts',
    createService: () => {
        return `
            import Service from '../core/Service'
            import CanService from '../contracts/CanService'

            export default class HomeTest extends Service implements CanService {

                constructor(port: number = null) {
                    super();
                    this.listenDataService();
                }

                public hello(name: string) {
                    return ("Hello " + name);
                }
                public listenDataService() {
                    this.messenger.on('data service', data => {
                        if(data.serviceId === this.id) {
                            this[data.payload.action](...data.payload.parameters);
                        }
                    });
                }
            }
        `;
    },
    createSecondService: () => {
        return `
            import Service from '../core/Service'
            import CanService from '../contracts/CanService';

            export default class SecondTest extends Service implements CanService { 
                constructor(port: number = null) {
                    super();
                    this.listenDataService();
                }

                public say(name: string) { 
                    return ("Aloha " + name); 
                }

                public listenDataService() {
                    this.messenger.on('data service', data => {
                        if(data.serviceId === this.id) {
                            this[data.payload.action](...data.payload.parameters);
                        }
                    });
                }
            }
        `;
    },
    downServices: (services: Array<Service>) => {
        services.forEach(item => {
            item.down();
        });
    },
    upServices: (manager: Manager): Array<Service> => {
        const services = [];
        manager.messenger.on('service manager register', data => {
            switch(data.action) {
                case 'register':
                    manager.services.push({
                        id: data.payload.id,
                        name: data.service,
                        ports: data.payload.ports
                    });
                    break;
                default:
                    break;
            }
        });

        const files = fs.readdirSync(path.resolve(__dirname, '../src/services'));
        files.forEach(item => {
            const file = require(`${SERVICE_PATH}/${item}`);
            const [className] = item.split('.');
            const service = new file.default();
            service.setName(className);
            service.run();
            services.push(service);
        });
        return services;
    },

};

export default helpers;
