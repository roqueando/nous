export default interface CanManage {
    services: Array<string>;
    upServices(): Promise<any>;
    getServices(): Array<string>;
}
