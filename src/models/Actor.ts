import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn } from "typeorm";
import { Image } from "./Image";
import { MovieCharacter } from "./MovieCharacter";

@Entity()
export class Actor {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Image, image => image.actors, {
    cascade: true,
    onDelete: 'CASCADE',
    eager: true,
  }) // Not really many to many, but we want a separate table for this
  @JoinTable({ name: 'actor_image' })
  images: Image[];

  @OneToMany(() => MovieCharacter, character => character.actor)
  characters: MovieCharacter[];
}