import HttpException from "./HttpException";

export class NotAuthorizedException extends HttpException {
  constructor() {
    super(403, 'Not authorized');
  }
}