import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./User";
import { Movie } from "./Movie";
import { UserOngoing } from "./UserOngoing";

@Entity()
export class UserOngoingMovie extends UserOngoing {
  @PrimaryColumn()
  movieId: number;

  @ManyToOne(() => User, user => user.ongoingMovies, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Movie, movie => movie.usersWatching, { onDelete: 'CASCADE', eager: true })
  movie: Movie;
}
