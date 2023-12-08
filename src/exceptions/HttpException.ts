export default class HttpException extends Error {
  constructor(public status: number, public message: string, public info?: unknown) {
    super(message);
  }
}
