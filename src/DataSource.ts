import "reflect-metadata";
import { DataSource } from "typeorm";
import { Library } from "./models/Library";
import { Movie } from "./models/Movie";
import { MovieMetadata } from "./models/MovieMetadata";
import { Genre } from "./models/Genre";
import { Image } from "./models/Image";
import { MovieCharacter } from "./models/MovieCharacter";
import { Actor } from "./models/Actor";
import { Show } from "./models/Show";
import { ShowMetadata } from "./models/ShowMetadata";
import { Season } from "./models/Season";
import { SeasonMetadata } from "./models/SeasonMetadata";
import { Episode } from "./models/Episode";
import { EpisodeMetadata } from "./models/EpisodeMetadata";
import { User } from "./models/User";
import { UserOngoingMovie } from "./models/UserOngoingMovie";
import { UserOngoingEpisode } from "./models/UserOngoingEpisode";

export const AppDataSource = new DataSource({
  synchronize: true,
  logging: false,
  entities: [
    Library,
    Movie,
    MovieMetadata,
    Genre,
    Image,
    MovieCharacter,
    Actor,
    Show,
    ShowMetadata,
    Season,
    SeasonMetadata,
    Episode,
    EpisodeMetadata,
    User,
    UserOngoingMovie,
    UserOngoingEpisode,
  ],
  migrations: [],
  subscribers: [],
  type: "sqlite",
  database: "db.sqlite",
});
