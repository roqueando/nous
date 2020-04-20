import Manager from '../../src/core/Manager';
import { createConnection, Socket  } from 'net';
import helpers from '../helpers';
import Service from '../../src/core/Service';
import Token from '../../src/core/Token';
import { setTimeout } from 'timers';
import Client from '../../src/core/Client';

describe('nous tests', () => {
    let manager: Manager;
    const PORT = 8080;
    let serviceOne: Service;
    let serviceTwo: Service;
    let client: Client;

    beforeAll(() => {
        manager = new Manager(PORT);
        manager.run();

        const [firstService, secondService] = helpers.upServices();
        serviceOne = firstService;
        serviceTwo = secondService;
        client = new Client();
    })

    afterAll(() => {
        manager.down();
        helpers.downServices([serviceOne, serviceTwo]);
    })

    test('should service was up correctly', () => {
        const socket = createConnection(serviceOne.port);
        const socket2 = createConnection(serviceTwo.port);
        
        expect(socket2.connecting).toBe(true);
        expect(socket.connecting).toBe(true);
        socket.destroy();
        socket2.destroy();
    });
    
    test('should have services registered', () => {
        expect(serviceOne.isRegistered).toBeTruthy();
        expect(serviceTwo.isRegistered).toBeTruthy();
    });

    test('should manager and services up', () => {
        expect(manager.server.listening).toBeTruthy();
        expect(serviceOne.server.listening).toBeTruthy();
        expect(serviceTwo.server.listening).toBeTruthy();
    });

    test('should send data to a service', async (done) => {
        setTimeout(async () => {
            const result = await client.send("HomeTest", {
                action: 'hello',
                parameters: ['John']
            });
            expect(result).toBe("Hello John");
            done();
        }, 10);
    });

    test('should send data to second service', done => {
        setTimeout(async () => {
            const result = await client.send("SecondTest", {
                action: 'say',
                parameters: ['John']
            });
            expect(result).toBe("Aloha John");
            done();
        }, 10);
    })

    test('should manager have services on list', () => {
        expect(manager.services.length).toBeGreaterThan(0);
    });


    test('should return a log with all correctly infos', (done) => {
        const client = createConnection({port: manager.port});
        client.write(JSON.stringify({
            isService: false,
            action: 'log',
            payload: {
                service: null
            }
        }));
        client.on('data', payload => {
            const parsed = JSON.parse(payload.toString());
            const host_1 = JSON.parse(parsed.services[0].host);
            const host_2 = JSON.parse(parsed.services[1].host);

            expect(parsed.manager.id).toBe("#");
            expect(parsed.manager.name).toBe("Manager");
            expect(parsed.manager.port).toBe(manager.port);

            // services
            expect(parsed.services[0]).toStrictEqual({
                name: serviceOne.name,
                id: serviceOne.id,
                port: serviceOne.port,
                host: JSON.stringify(host_1),
            });
            expect(parsed.services[1]).toStrictEqual({
                name: serviceTwo.name,
                id: serviceTwo.id,
                port: serviceTwo.port,
                host: JSON.stringify(host_2),
            });
            done();
        })
    });

    test('should return a log with one correct info', done => {
        const client = createConnection({port: manager.port});
        client.write(JSON.stringify({
            isService: false,
            action: 'log',
            payload: {
                service: 'HomeTest'
            }
        }));
        client.on('data', payload => {
            const parsed = JSON.parse(payload.toString());
            expect(parsed.name).toBe(serviceOne.name);
            expect(parsed.ports).toBe(`${serviceOne.port}`);
            expect(parsed.nodes).toBe(1);
            done();
        })
    });

    test('should send a message to all services to down server', () => {
        const token = new Token().getToken();
        const client = createConnection({ port: manager.port  });
        client.write(JSON.stringify({
            isService: false,
            action: 'down',
            payload: {
               from: token 
            }
        }));
    });

    test('should all services and manager down', (done) => {
        setTimeout(() => {
            expect(serviceOne.server.listening).toBeFalsy();
            expect(serviceOne.server.listening).toBeFalsy();
            expect(manager.server.listening).toBeFalsy();
            done();
        }, 1000);
    });

});
