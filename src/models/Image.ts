import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Actor } from "./Actor";
import { MovieMetadata } from "./MovieMetadata";
import { ShowMetadata } from "./ShowMetadata";
import { SeasonMetadata } from "./SeasonMetadata";
import { EpisodeMetadata } from "./EpisodeMetadata";

export enum ImageType {
  POSTER = 'POSTER',
  BACKDROP = 'BACKDROP',
  LOGO = 'LOGO',
}

@Entity()
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ enum: ImageType })
  type: ImageType;

  @Column()
  preferred: boolean;

  @Column()
  data: string;

  @ManyToMany(() => Actor, actor => actor.images, { onDelete: 'CASCADE' })
  actors: Actor[];

  @ManyToMany(() => MovieMetadata, metadata => metadata.images, { onDelete: 'CASCADE' })
  movieMetadata: MovieMetadata[];

  @ManyToMany(() => ShowMetadata, metadata => metadata.images, { onDelete: 'CASCADE' })
  showMetadata: ShowMetadata[];

  @ManyToMany(() => SeasonMetadata, metadata => metadata.images, { onDelete: 'CASCADE' })
  seasonMetadata: SeasonMetadata[];

  @ManyToMany(() => EpisodeMetadata, metadata => metadata.images, { onDelete: 'CASCADE' })
  episodeMetadata: EpisodeMetadata[];
}