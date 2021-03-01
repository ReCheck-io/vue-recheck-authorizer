export function getOrigin(string) {
  let url = new URL(string);
  if (url.pathname.includes('/chain/')) {
    return url.origin + '/chain'
  }

  return url.origin;
}

export * from './logger'