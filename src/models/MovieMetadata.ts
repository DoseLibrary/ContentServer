import "reflect-metadata";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { Movie } from "./Movie";
import { Genre } from "./Genre";
import { Image } from "./Image";
import { MovieCharacter } from "./MovieCharacter";

@Entity()
export class MovieMetadata {
  @PrimaryColumn()
  movieId: number;

  @JoinColumn()
  @OneToOne(() => Movie, movie => movie.metadata, { onDelete: 'CASCADE' })
  movie: Movie;

  @Column()
  title: string;

  @Column()
  overview: string;

  @Column({ type: 'date' })
  releaseDate: Date;

  @Column()
  externalId: number;

  @Column()
  popular: boolean;

  @ManyToMany(() => Genre, genre => genre.movies, {
    cascade: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinTable({ name: 'movie_metadata_genre' })
  genres: Genre[];

  @ManyToMany(() => MovieMetadata, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'movie_metadata_recommendation',
    joinColumn: { name: 'movieId1' },
    inverseJoinColumn: { name: 'movieId2' }
  })
  recommendations: MovieMetadata[];

  @ManyToMany(() => Image, {
    cascade: true,
    onDelete: 'CASCADE',
    eager: true,
  }) // Not really many to many, but we want a separate table for this
  @JoinTable({ name: 'movie_metadata_image' })
  images: Image[];

  @OneToMany(() => MovieCharacter, character => character.metadata, {
    cascade: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  characters: MovieCharacter[];
}