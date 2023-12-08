export const valueExistInEnum = <T extends {}>(someEnum: T, value: string | number): boolean =>
  Object.values(someEnum).includes(value);
