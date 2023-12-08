export default class UnsuportedFormatException extends Error {
  constructor(public format: string) {
    super(`File format unsuported (${format})`);
  }
}
