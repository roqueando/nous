import CanMessage from '../contracts/CanMessage';

export default interface CanManage extends CanMessage {
    services: Array<string>;
    upServices(): void;
    getServices(): Array<string>;
    run(): Promise<any>;
}
