import { Entity, ManyToMany, PrimaryColumn } from "typeorm";
import { MovieMetadata } from "./MovieMetadata";
import { ShowMetadata } from "./ShowMetadata";

@Entity()
export class Genre {
  @PrimaryColumn()
  name: string;

  @ManyToMany(() => MovieMetadata, metadata => metadata.genres, { onDelete: 'CASCADE' })
  movies: MovieMetadata[];

  @ManyToMany(() => ShowMetadata, metadata => metadata.genres, { onDelete: 'CASCADE' })
  shows: ShowMetadata[];
}