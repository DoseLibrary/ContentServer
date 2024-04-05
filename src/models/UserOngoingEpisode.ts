import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { UserOngoing } from "./UserOngoing";
import { User } from "./User";
import { Episode } from "./Episode";

@Entity()
export class UserOngoingEpisode extends UserOngoing {
  @PrimaryColumn()
  showId: number;

  @PrimaryColumn()
  seasonNumber: number;

  @PrimaryColumn()
  episodeNumber: number;

  @ManyToOne(() => User, user => user.ongoingEpisodes, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Episode, episode => episode.usersWatching, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({
    name: 'showId',
    referencedColumnName: 'showId',
  })
  @JoinColumn({
    name: 'seasonNumber',
    referencedColumnName: 'seasonNumber',
  })
  @JoinColumn({
    name: 'episodeNumber',
    referencedColumnName: 'episodeNumber',
  })
  episode: Episode;
}