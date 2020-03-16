import Manager from '../../src/core/Manager';

describe('Manager', () => {
    
    let instance: Manager;

    beforeEach(() => {
        instance = new Manager('127.0.0.1', 8080);

        instance.setType('node')
            .manager()
            .run();
    });

    afterEach(() => {
        instance.down();
    });
    it('should run manager correctly', async () => {
        expect(instance).toBeInstanceOf(Manager);
    });

});
