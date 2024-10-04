export function deepFreeze<T extends { [key: string]: any }>(
  obj: T
): Readonly<T> {
  if (typeof obj !== 'object') {
    throw new Error('Only objects can be frozen');
  }

  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object' && !Object.isFrozen(obj[key])) {
      deepFreeze(obj[key]);
    }
  });

  return Object.freeze(obj);
}
