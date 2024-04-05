import { Column, PrimaryColumn } from "typeorm";

export abstract class UserOngoing {
  @PrimaryColumn()
  userId: number;

  @Column()
  time: number;

  @Column({ type: 'date' })
  lastWatched: Date;
}
