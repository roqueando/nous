type ActionRegister = {
  service: string,
  payload: {
    id: string,
    port: number,
    host: {
      port: number,
      family: string,
      address: string
    }
  }
}

export default ActionRegister;
