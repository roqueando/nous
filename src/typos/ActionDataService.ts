type ActionDataService = {
  service: string,
  remotePort: number,
  payload: {
    action: string,
    parameters: Array<any>,
  }
}

export default ActionDataService;
