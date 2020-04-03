export default interface CanManage {
    services: Array<string>;
    getServices(): Array<string>;
    run(): void;
}
