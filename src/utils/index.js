export function getOrigin(string) {
  return (new URL(string)).origin;
}
export * from './logger'