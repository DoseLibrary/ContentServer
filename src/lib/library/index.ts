import { EventEmitter } from "events";
import { LibraryType, Library as LibraryModel, PrismaClient } from "@prisma/client";
import { Library } from "./Library";
import { MovieLibrary } from "./MovieLibrary";
import { RepositoryManager } from "../repository";
import { ShowLibrary } from "./ShowLibrary";

export const createLibraryFromModel = (
  model: LibraryModel,
  repository: RepositoryManager,
  emitter: EventEmitter
): Library => {
  switch (model.type) {
    case LibraryType.MOVIE:
      return new MovieLibrary(model, repository, emitter);
    case LibraryType.SHOW:
      return new ShowLibrary(model, repository, emitter);
    default:
      throw new Error(`Library ${model.type} is not implemented yet`);
  }
}
