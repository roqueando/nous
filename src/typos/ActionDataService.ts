type ActionDataService = {
  action: string,
  service: string,
  remotePort: number,
  isService: boolean,
  payload: {
    action: string,
    parameters: Array<any>,
  }
}

export default ActionDataService;
