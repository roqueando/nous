import Manager from './core/Manager';

export default class Application {
    public run() {
        const manager = new Manager(8080);
        manager.run();
        manager.upServices();
    }
}
