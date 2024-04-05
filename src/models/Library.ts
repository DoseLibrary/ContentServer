import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Movie } from "./Movie";
import { Show } from "./Show";

export enum LibraryType {
  MOVIE = 'MOVIE',
  SHOW = 'SHOW',
};

@Entity()
export class Library {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({enum: LibraryType})
  type: LibraryType;

  @Column()
  path: string;

  @OneToMany(() => Movie, movie => movie.library)
  movies: Movie[];

  @OneToMany(() => Show, show => show.library)
  shows: Show[];
}
