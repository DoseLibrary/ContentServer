import { AppDataSource } from "../DataSource";
import { MovieCharacter } from "../models/MovieCharacter";

export const MovieCharacterRepository = AppDataSource.getRepository(MovieCharacter).extend({ });