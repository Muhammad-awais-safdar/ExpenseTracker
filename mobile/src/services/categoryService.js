import api from "../api/axios";

const CategoryService = {
  getAll: async () => {
    const response = await api.get("/api/categories");
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/api/categories", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/api/categories/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/api/categories/${id}`);
  },
};

export default CategoryService;
