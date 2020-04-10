import {Payload} from '../typos';
import {Buffer} from 'buffer';
import crypto from 'crypto';

export default class Token {
  protected key: string;
  protected header: any;
  protected bufferedHeader: string;
  protected payload: string;

  constructor(key?: string, data?: Payload) {
    this.key = key;
    this.header = {
      "typ": "JWT",
      "alg": "HS256"
    }
    this.bufferedHeader = Buffer.from(JSON.stringify(this.header)).toString('base64');
    this.payload = this.createPayload(data);
  }

  public getToken(): string {
    return `${this.bufferedHeader}.${this.payload}.${this.createSignature(this.bufferedHeader, this.payload)}`
  }
  private createSignature(header: string, payload: string): string {
    let signature = crypto.createHmac('sha256', this.key ? this.key : 'default')
      .update(`${header}.${payload}`)
      .digest('base64');

    return Buffer.from(signature).toString('base64');
  }

  public static verify(token: string, key?: string): boolean {
    const [header, payload, signature] = token.split('.');
    let sig = crypto.createHmac('sha256', key ? key : 'default')
      .update(`${header}.${payload}`)
      .digest('base64');

    const valid = Buffer.from(sig).toString('base64');

    return valid === signature;
  }
  private createPayload(data: Payload): string {
    if(!data) {
      let payload: Payload = {
        iss: "nous.project",
        iat: Date.now(),
        exp: new Date().setMinutes(21600),
      }
      let buffer = JSON.stringify(payload);
      return Buffer.from(buffer).toString('base64');
    }
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }
}
