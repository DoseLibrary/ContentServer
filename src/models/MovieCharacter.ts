import { Entity, ManyToOne } from "typeorm";
import { MovieMetadata } from "./MovieMetadata";
import { Character } from "./Character";
import { Actor } from "./Actor";

@Entity({ name: 'movie_metadata_character' })
export class MovieCharacter extends Character {
  @ManyToOne(() => MovieMetadata, metadata => metadata.characters, { onDelete: 'CASCADE' })
  metadata: MovieMetadata;

  @ManyToOne(() => Actor, actor => actor.characters, {
    cascade: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  actor: Actor;
}