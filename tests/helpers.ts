import * as fs from 'fs';
import * as path from 'path';
import Service from '../src/core/Service';
import Manager from '../src/core/Manager';

const SERVICE_PATH = path.resolve(__dirname, './Fixtures/services');

const helpers = {
    SERVICE_PATH,
    firstFilename: path.resolve(SERVICE_PATH) + '/HomeTest.ts',
    secondFilename: path.resolve(SERVICE_PATH) + '/SecondTest.ts',
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

        const files = fs.readdirSync(SERVICE_PATH)
        .filter((file) => {
            return file !== '.gitkeep';
        });
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
