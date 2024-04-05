import { AppDataSource } from "../DataSource";
import { MovieMetadata } from "../models/MovieMetadata";

export const MovieMetadataRepository = AppDataSource.getRepository(MovieMetadata).extend({ });