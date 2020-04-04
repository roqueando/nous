import Service from '../core/Service';

export default interface Serviceable {
    ignore: boolean;
    id: string;
    name: string;
    register(): void;
    setName(name: string): Service;
    port: number;
}
