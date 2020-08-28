import {Service} from '../../../src';

export default class SecondTest extends Service { 
  say(name: string) { 
    return ("Aloha " + name); 
  }
}

