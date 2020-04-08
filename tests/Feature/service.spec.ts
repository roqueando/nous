import Manager from '../../src/core/Manager';
import helpers from '../helpers';
import Service from '../../src/core/Service';
import {createConnection, Socket} from 'net';

describe('Service', () => {
    let manager: Manager;
    const PORT = 8080;
    let serviceOne: Service;
    let serviceTwo: Service;
    let client: Socket;

    beforeEach((done) => {
        manager = new Manager(PORT)
        manager.run();

        const [firstService, secondService] = helpers.upServices();
        serviceOne = firstService;
        serviceTwo = secondService;
        client = createConnection(manager.port); 
        client.on('connect', () => {
            done();
        });
    });

    afterEach((done) => {
        serviceOne.socket.destroy();
        serviceTwo.socket.destroy();
        helpers.downServices([serviceOne, serviceTwo]);
        manager.down();
        if(client.connecting) {
            client.destroy();
        }
        done();
    });

    test('should manager and services up', () => {
        expect(manager.server.listening).toBeTruthy();
        expect(serviceOne.server.listening).toBeTruthy();
        expect(serviceTwo.server.listening).toBeTruthy();
    });

    test('should send data to a service', (done) => {
        client.write(JSON.stringify({
            service: 'HomeTest',
            action: 'data service',
            isService: false,
            payload: {
                action: 'hello',
                parameters: [
                    'John'
                ]
            }
        }));
        client.on('data', payload => {
            expect(payload.toString()).toBe("Hello John");
            done();
        });
    });

    test('should send data to second service', done => {
        client.write(JSON.stringify({
            service: 'SecondTest',
            action: 'data service',
            isService: false,
            payload: {
                action: 'say',
                parameters: [
                    'John'
                ],
            }
        }));
        client.on('data', payload => {
            expect(payload.toString()).toBe("Aloha John");
            done();
        });
    })
});
