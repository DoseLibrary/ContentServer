import { Category } from "../Category";
import { Character } from "../Character";
import { MovieMetadata } from "./MovieMetadata";

export class Movie {
  constructor(
    public id: number,
    public genres: Category[],
    public characters: Character[],
    public trailer?: string,
    public metadata?: MovieMetadata,
  ) { }
}