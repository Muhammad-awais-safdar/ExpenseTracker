import api from "../api/axios";

const ExpenseService = {
  getAll: async (page = 1) => {
    const response = await api.get(`/api/expenses?page=${page}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/api/expenses", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/api/expenses/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/api/expenses/${id}`);
  },
};

export default ExpenseService;
