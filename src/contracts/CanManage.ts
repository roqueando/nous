import CanMessage from '../contracts/CanMessage';
import Manager from '../core/Manager';

export default interface CanManage extends CanMessage {
    services: Array<string>;
    upServices(): void;
    getServices(): Array<string>;
    run(): Manager;
}
