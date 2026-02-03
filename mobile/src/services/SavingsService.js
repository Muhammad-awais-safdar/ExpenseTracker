import api from "../api/axios";

const SavingsService = {
  getAll: async () => {
    const response = await api.get("/savings/goals");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/savings/goals/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/savings/goals", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/savings/goals/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/savings/goals/${id}`);
    return response.data;
  },

  addTransaction: async (goalId, data) => {
    const response = await api.post(
      `/savings/goals/${goalId}/transaction`,
      data,
    );
    return response.data;
  },
};

export default SavingsService;
