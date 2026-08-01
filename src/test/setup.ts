// Test setup file for Vitest

const storage = new Map<string, string>();
const localStorageMock: Storage = {
  get length() {
    return storage.size;
  },
  clear: () => storage.clear(),
  getItem: (key) => storage.get(key) ?? null,
  key: (index) => Array.from(storage.keys())[index] ?? null,
  removeItem: (key) => {
    storage.delete(key);
  },
  setItem: (key, value) => {
    storage.set(key, value);
  },
};

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: localStorageMock,
});

// Mock URL.createObjectURL and URL.revokeObjectURL for export tests
if (typeof URL.createObjectURL === 'undefined') {
  URL.createObjectURL = (): string => 'blob:mock-url';
}

if (typeof URL.revokeObjectURL === 'undefined') {
  URL.revokeObjectURL = (): void => {};
}

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;
