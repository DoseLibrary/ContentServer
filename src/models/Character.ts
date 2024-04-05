import { Column, PrimaryGeneratedColumn } from "typeorm";

export abstract class Character {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  orderInCredit: number;
}