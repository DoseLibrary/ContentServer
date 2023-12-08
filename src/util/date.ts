// TODO: rename function
export function cleanDate(date: Date | string): string;
export function cleanDate(date?: Date | string): string | undefined;
export function cleanDate(date: any) {
  return date ? new Date(date).toISOString().split('T')[0] : undefined;
}