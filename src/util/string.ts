export const isString = (x: unknown): x is string => {
  return typeof x === 'string';
}
