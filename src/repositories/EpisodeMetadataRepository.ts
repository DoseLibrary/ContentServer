import { AppDataSource } from "../DataSource";
import { EpisodeMetadata } from "../models/EpisodeMetadata";

export const EpisodeMetadataRepository = AppDataSource.getRepository(EpisodeMetadata).extend({});
