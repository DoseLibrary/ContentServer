import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { Show } from "./Show";
import { SeasonMetadata } from "./SeasonMetadata";
import { Episode } from "./Episode";

@Entity()
export class Season {
  @PrimaryColumn()
  showId: number;

  @PrimaryColumn()
  seasonNumber: number;

  @Column({ type: 'date', default: () => 'CURRENT_TIMESTAMP'})
  addedDate: Date;

  @Column()
  path: string;

  @OneToOne(() => SeasonMetadata, metadata => metadata.season, { cascade: true, onDelete: 'CASCADE', eager: true })
  metadata?: SeasonMetadata;

  @ManyToOne(() => Show, show => show.seasons, { onDelete: 'CASCADE' })
  show: Show;

  @OneToMany(() => Episode, episode => episode.season, { cascade: true, onDelete: 'CASCADE', eager: true })
  episodes: Episode[];
}