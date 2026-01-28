const store = {};

const MemoryCache = {
  set: (key, data, ttlSeconds = 300) => {
    const expiry = Date.now() + ttlSeconds * 1000;
    store[key] = { data, expiry };
  },

  get: (key) => {
    const item = store[key];
    if (!item) return null;

    if (Date.now() > item.expiry) {
      delete store[key];
      return null;
    }

    return item.data;
  },

  del: (key) => {
    delete store[key];
  },

  clear: () => {
    for (const key in store) {
      delete store[key];
    }
  },
};

export default MemoryCache;
