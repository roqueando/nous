import {Register} from '../typos';
export default function ActionRegister (data: Register, services: Array<any>): void {
  services.push({
    name: data.service,
    id: data.payload.id,
    port: data.payload.port,
    host: data.payload.host
  });
}
