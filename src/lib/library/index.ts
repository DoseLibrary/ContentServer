import { EventEmitter } from "events";
import { Library } from "./Library";
import { MovieLibrary } from "./MovieLibrary";
import { ShowLibrary } from "./ShowLibrary";
import { LibraryType } from "../../models/Library";

export const createLibraryFromModel = (
  id: number,
  type: LibraryType,
  name: string,
  path: string,
  emitter: EventEmitter
): Library => {
  switch (type) {
    case LibraryType.MOVIE:
      return new MovieLibrary(
        id,
        name,
        path,
        emitter
      );
    case LibraryType.SHOW:
      return new ShowLibrary(
        id,
        name,
        path,
        emitter
      );
    default:
      throw new Error(`Library ${type} is not implemented yet`);
  }
}
