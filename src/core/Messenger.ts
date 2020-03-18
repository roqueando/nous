import { EventEmitter } from 'events';

export default class Messenger extends EventEmitter {
    private static instance: Messenger;

    static getInstance(): Messenger {
        if(!Messenger.instance) {
            Messenger.instance = new Messenger();
        }
        return Messenger.instance;
    }
}
