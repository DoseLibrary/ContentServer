import { AppDataSource } from "../DataSource";
import { ShowMetadata } from "../models/ShowMetadata";

export const ShowMetadataRepository = AppDataSource.getRepository(ShowMetadata).extend({ });
