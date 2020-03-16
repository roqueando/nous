import Manager from './core/Manager';

export default class Application {
    public run() {
       (new Manager('127.0.0.1', 8080)).run(); 
    }
}
