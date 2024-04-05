export class EntityNotFoundException extends Error {
  constructor(entity: string, id: string | number) {
    super(`Entity ${entity} with id ${id} not found`);
  }
}