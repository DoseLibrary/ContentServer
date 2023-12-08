import { Client } from "./Client";

export class UnknownClient extends Client {
  constructor() {
    super('Unknown', 0, [], []);
  }
}