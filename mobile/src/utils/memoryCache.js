import AsyncStorage from "@react-native-async-storage/async-storage";

// In-memory cache for fast access during session
let memoryStore = {};

const MemoryCache = {
  // Load all cached entries from AsyncStorage into memory on startup
  init: async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cachedKeys = keys.filter((k) => k.startsWith("cache_"));
      if (cachedKeys.length > 0) {
        const stores = await AsyncStorage.multiGet(cachedKeys);
        stores.forEach(([key, value]) => {
          if (value) {
            const cleanKey = key.replace("cache_", "");
            memoryStore[cleanKey] = JSON.parse(value);
          }
        });
      }
      console.log("[Cache] Initialized", Object.keys(memoryStore));
    } catch (e) {
      console.error("Cache init failed", e);
    }
  },

  set: async (key, data, ttlSeconds = 300) => {
    const expiry = Date.now() + ttlSeconds * 1000;
    const item = { data, expiry };

    // Update memory
    memoryStore[key] = item;

    // Update storage asynchronously
    try {
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch (e) {
      console.error("Cache set failed", e);
    }
  },

  get: (key) => {
    const item = memoryStore[key];
    if (!item) return null;

    // Check expiry
    if (Date.now() > item.expiry) {
      // Lazy delete
      delete memoryStore[key];
      AsyncStorage.removeItem(`cache_${key}`).catch(console.error);
      return null;
    }

    return item.data;
  },

  // New method: get even if expired (for offline mode)
  getStale: (key) => {
    const item = memoryStore[key];
    return item ? item.data : null;
  },

  del: (key) => {
    delete memoryStore[key];
    AsyncStorage.removeItem(`cache_${key}`).catch(console.error);
  },

  clear: async () => {
    memoryStore = {};
    const keys = await AsyncStorage.getAllKeys();
    const cachedKeys = keys.filter((k) => k.startsWith("cache_"));
    if (cachedKeys.length > 0) {
      await AsyncStorage.multiRemove(cachedKeys);
    }
  },
};

export default MemoryCache;
