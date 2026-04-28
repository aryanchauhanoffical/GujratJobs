const inMemoryStore = {};

const isStorageAvailable = (() => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
})();

export const safeStorage = {
  getItem(key) {
    if (!isStorageAvailable) return inMemoryStore[key] ?? null;
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return inMemoryStore[key] ?? null;
    }
  },
  setItem(key, value) {
    if (!isStorageAvailable) { inMemoryStore[key] = value; return; }
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      inMemoryStore[key] = value;
    }
  },
  removeItem(key) {
    delete inMemoryStore[key];
    if (!isStorageAvailable) return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // already removed from inMemoryStore
    }
  },
};
