import { RepositoryManager } from "../repository";

export interface Character {
  name: string;
  actor: {
    name: string;
    imageId?: number;
    id: number
  };
}

export const getMovieCharactersByMovieId = (repository: RepositoryManager, id: number): Promise<Character[]> => {
  return repository.movie.raw().findFirst({
    where: {
      id
    },
    select: {
      movieMetadata: {
        select: {
          characters: {
            select: {
              actor: {
                select: {
                  image: {
                    select: {
                      id: true
                    }
                  },
                  name: true,
                  id: true
                }
              },
              name: true,
              orderInCredit: true
            }
          },
        }
      }
    }
  }).then(result => result?.movieMetadata?.characters || [])
    .then(characters => characters.sort((a, b) => a.orderInCredit > b.orderInCredit ? 1 : -1))
    .then(characters => characters.map(character => ({
      name: character.name,
      orderInCredit: character.orderInCredit,
      actor: {
        name: character.actor.name,
        imageId: character.actor.image?.id,
        id: character.actor.id
      }
    })));
}