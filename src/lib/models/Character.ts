import { Actor } from "./Actor";

export class Character {
  constructor(public name: string, public orderInCredit: number, public actor: Actor) { }
}