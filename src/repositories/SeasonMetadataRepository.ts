import { AppDataSource } from "../DataSource";
import { SeasonMetadata } from "../models/SeasonMetadata";

export const SeasonMetadataRepository = AppDataSource.getRepository(SeasonMetadata).extend({});
