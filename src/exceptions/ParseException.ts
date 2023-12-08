export default class ParseException extends Error {
  constructor(public message: string) {
    super(message);
  }
}