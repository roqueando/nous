import CanMessage from '../contracts/CanMessage';

export default interface CanManage extends CanMessage {
    services: Array<string>;
    upServicesListener(): void;
    getServices(): Array<string>;
    run(): void;
}
