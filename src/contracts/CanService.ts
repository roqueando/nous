import Service from '../core/Service';
export default interface CanService {
    ignore: boolean;
    name: string;
    register(): void;
    setName(name: string): Service;
    port: number;
}
