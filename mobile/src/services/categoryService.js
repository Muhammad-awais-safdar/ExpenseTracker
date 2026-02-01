import api from "../api/axios";

import MemoryCache from "../utils/memoryCache";

const CategoryService = {
  getAll: async () => {
    // Return cached if available (Stale)
    const cached = MemoryCache.getStale("categories_all");
    if (cached) return cached;

    // Fetch fresh
    const response = await api.get("/api/categories");
    const data = response.data;

    // Update Cache
    await MemoryCache.set("categories_all", data);
    return data;
  },

  // Force refresh method
  refresh: async () => {
    const response = await api.get("/api/categories");
    await MemoryCache.set("categories_all", response.data);
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
