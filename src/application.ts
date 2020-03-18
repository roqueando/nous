import Manager from './core/Manager';

export default class Application {
    public run() {
       (new Manager(8080))
        .run()
        .upServices();
    }
}
