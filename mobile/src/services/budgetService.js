import api from "../api/axios";

const BudgetService = {
  getAll: async () => {
    const response = await api.get("/api/budgets");
    return response.data;
  },
  create: async (data) => {
    const response = await api.post("/api/budgets", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/api/budgets/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/api/budgets/${id}`);
  },
};

export default BudgetService;
