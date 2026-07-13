export function getStorage<T>(
  storage: Storage,
  key: string,
  validate: (value: unknown) => T,
) {
  try {
    const item = storage.getItem(key);

    if (!item) {
      throw new Error(`No value found for "${key}".`);
    }

    const value = JSON.parse(item) as T;

    return validate(value);
  } catch {
    return null;
  }
}

export function setStorage<T>(storage: Storage, key: string, value: T) {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
