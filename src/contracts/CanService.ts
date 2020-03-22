import CanMessage from '../contracts/CanMessage';
import Service from '../core/Service';

export default interface CanService extends CanMessage {
    ignore: boolean;
    id: string;
    name: string;
    register(): void;
    setName(name: string): Service;
    port: number;
    listenDataService(): void;
}
