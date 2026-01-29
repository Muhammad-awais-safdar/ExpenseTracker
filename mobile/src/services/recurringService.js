import api from "../api/axios";

const RecurringService = {
  getAll: async () => {
    const response = await api.get("/api/recurring");
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/api/recurring", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/api/recurring/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/api/recurring/${id}`);
  },
};

export default RecurringService;
