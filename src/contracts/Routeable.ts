export default interface Routeable {
  get(request, response): any,
  post(request, response): any,
  put(request, response): any,
  delete(request, response): any
}
