import { EventEmitter } from 'events';

export default class Messenger extends EventEmitter {
    public static instance: Messenger;

    static getInstance(): Messenger {
        if(!Messenger.instance) {
            Messenger.instance = new Messenger();
        }
        return Messenger.instance;
    }

    public send(nodeId: string, data: object): void {
        this.emit(`data service`, {
            serviceId: nodeId,
            payload: data
        });
    }

    public sendToManager(data: object, clientPort?: number): void {
        const obj = {
            payload: data,
            remotePort: clientPort
        }
        this.emit(`data manager`, obj);
    }
}
