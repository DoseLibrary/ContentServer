import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Movie } from "./Movie";
import { Episode } from "./Episode";
import { UserOngoingMovie } from "./UserOngoingMovie";
import { UserOngoingEpisode } from "./UserOngoingEpisode";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  hasAccess: boolean;

  @OneToMany(() => UserOngoingMovie, ongoingMovie => ongoingMovie.user, {
    onDelete: 'CASCADE',
  })
  ongoingMovies: UserOngoingMovie[];

  @OneToMany(() => UserOngoingEpisode, ongoingEpisode => ongoingEpisode.user, {
    onDelete: 'CASCADE',
  })
  ongoingEpisodes: UserOngoingEpisode[];

  @ManyToMany(() => Movie, movie => movie.usersWatchlist, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'user_watchlist_movies'
  })
  watchlistMovies: Movie[];

  @ManyToMany(() => Movie, movie => movie.usersWatched, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'user_watched_movies'
  })
  watchedMovies: Movie[];
}
