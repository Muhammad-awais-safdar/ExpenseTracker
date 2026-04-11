import api from "../api/axios";

import MemoryCache from "../utils/memoryCache";

const CategoryService = {
  getAll: async () => {
    try {
      // 1. Try to fetch fresh data first if online
      const response = await api.get("/api/categories");
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      
      // Update cache with fresh data
      await MemoryCache.set("categories_all", data);
      return data;
    } catch (error) {
      // 2. Fallback to stale cache only on network failure
      const cached = MemoryCache.getStale("categories_all");
      if (cached && Array.isArray(cached) && cached.length > 0) {
        console.log("[CategoryService] Network failed, using stale cache");
        return cached;
      }
      throw error; // If no cache and no network, rethrow
    }
  },

  // Force refresh method
  refresh: async () => {
    const response = await api.get("/api/categories");
    const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
    await MemoryCache.set("categories_all", data);
    return data;
  },
  
  seed: async () => {
    const response = await api.post("/api/categories/seed");
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/api/categories", data);
    // Invalidate/Update cache
    const current = MemoryCache.getStale("categories_all") || [];
    await MemoryCache.set("categories_all", [...current, response.data]);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/api/categories/${id}`, data);
    // Update cache
    const current = MemoryCache.getStale("categories_all") || [];
    const updated = current.map((c) => (c.id === id ? response.data : c));
    await MemoryCache.set("categories_all", updated);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/api/categories/${id}`);
    // Update cache
    const current = MemoryCache.getStale("categories_all") || [];
    const updated = current.filter((c) => c.id !== id);
    await MemoryCache.set("categories_all", updated);
  },
};

export default CategoryService;
