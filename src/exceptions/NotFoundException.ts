import HttpException from "./HttpException";

export class NotFoundException extends HttpException {
  constructor(message?: string) {
    super(404, message || 'Not found');
  }
}