import { PrismaClient } from "@prisma/client";
import { MovieRepository } from "./movie/MovieRepository";
import { LibraryRepository } from "./LibraryRepository";
import { UserRepository } from "./UserRepository";
import { Config } from "../Config";
import { ShowRepository } from "./ShowRepository";
import { SeasonRepository } from "./SeasonRepository";
import { EpisodeRepository } from "./EpisodeRepository";
import { ImageRepository } from "./ImageRepository";
import { GenreRepository } from "./GenreRepository";
import { SubtitleRepository } from "./SubtitleRepository";

export interface RepositoryManager {
  movie: MovieRepository;
  library: LibraryRepository;
  user: UserRepository;
  show: ShowRepository;
  season: SeasonRepository;
  episode: EpisodeRepository;
  image: ImageRepository;
  genre: GenreRepository;
  subtitle: SubtitleRepository;
}

const setDbEnvVariable = (config: Config) => {
  const { database } = config;
  process.env['DATABASE_URL'] = `postgresql://${database.user}:${database.password}@${database.host}:${database.port}/${database.name}?schema=public`;
}

export const createRepositories = (prisma: PrismaClient, config: Config): RepositoryManager => {
  setDbEnvVariable(config);
  return {
    movie: new MovieRepository(prisma),
    library: new LibraryRepository(prisma),
    user: new UserRepository(prisma),
    show: new ShowRepository(prisma),
    season: new SeasonRepository(prisma),
    episode: new EpisodeRepository(prisma),
    image: new ImageRepository(prisma),
    genre: new GenreRepository(prisma),
    subtitle: new SubtitleRepository(prisma)
  }
}