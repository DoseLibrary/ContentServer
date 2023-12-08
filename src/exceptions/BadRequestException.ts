import { ValidationError } from "express-validator";
import HttpException from "./HttpException";

export class BadRequestException extends HttpException {
  constructor(validationErrors: ValidationError[]) {
    super(400, 'Bad request', validationErrors);
  }
}