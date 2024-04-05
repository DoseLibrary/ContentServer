import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryColumn } from "typeorm";
import { Image } from "./Image";
import { Episode } from "./Episode";

@Entity()
export class EpisodeMetadata {
  @PrimaryColumn()
  showId: number;

  @PrimaryColumn()
  seasonNumber: number;

  @PrimaryColumn()
  episodeNumber: number;

  @JoinColumn()
  @OneToOne(() => Episode, episode => episode.metadata, { onDelete: 'CASCADE' })
  episode: Episode;

  @Column({ type: 'date' })
  airDate: Date;

  @Column()
  title: string;

  @Column()
  overview: string;

  @Column()
  voteAverage: number;

  @ManyToMany(() => Image, image => image.episodeMetadata, {
    cascade: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinTable({ name: 'episode_metadata_image' })
  images: Image[];
}