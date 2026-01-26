import api from "../api/axios";

const IncomeService = {
  getAll: async (page = 1) => {
    const response = await api.get(`/api/incomes?page=${page}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/api/incomes", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/api/incomes/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/api/incomes/${id}`);
  },
};

export default IncomeService;
