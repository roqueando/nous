import Manager from '../../src/core/Manager';
import { createConnection  } from 'net';

describe('Manager', () => {
    
    let manager: Manager;
    const PORT = 8080;

    beforeEach(() => {
        manager = new Manager('127.0.0.1', PORT);

        manager.setType('node')
            .manager()
            .run();
    });

    afterEach(() => {
        manager.down();
    });
    it('should run manager correctly', () => {
        expect(manager).toBeInstanceOf(Manager);
        const socket = createConnection(PORT);
        expect(socket.connecting).toBe(true);
        socket.destroy();
    });

    it('should up the services', () => {
       manager.upServices();
       const services = manager.getServices();
       expect(services).toContain('HomeTest');
    });

});
