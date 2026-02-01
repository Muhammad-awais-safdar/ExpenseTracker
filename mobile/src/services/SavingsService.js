import api from "../api/axios";

const SavingsService = {
  getAll: async () => {
    const response = await api.get("/savings");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/savings/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/savings", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/savings/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/savings/${id}`);
    return response.data;
  },

  addTransaction: async (id, data) => {
    // data: { type: 'deposit'|'withdraw', amount, date, note }
    const response = await api.post(`/savings/${id}/transaction`, data);
    return response.data;
  },
};

export default SavingsService;
