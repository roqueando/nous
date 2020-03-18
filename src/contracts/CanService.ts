import CanMessage from '../contracts/CanMessage';
import Service from '../core/Service';

export default interface CanService extends CanMessage {
    ignore: boolean;
    name: string;
    register(): void;
    setName(name: string): Service;
    port: number;
}
